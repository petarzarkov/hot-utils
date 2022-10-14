import { Order, Transaction, WhereOptions, Op, ModelStatic, Model } from "sequelize";
import { MakeNullishOptional } from "sequelize/types/utils";
import { HotLogger } from "../hotLogger";
import { ok, fail } from "../../utils";

interface IBaseSequelizeRepo<
    ModelAttributes extends { id: string },
    ModelCreationAttributes extends Record<string, unknown>,
    CustomModel extends Model<ModelAttributes, ModelCreationAttributes>
> {
    table: ModelStatic<CustomModel>;
    mapTableToDTO: (model: CustomModel) => ModelAttributes;
    logger?: {
        enabled: true;
        instance?: HotLogger;
        logQueries?: boolean;
    } | { enabled: false };
}

type CommonCommanderOpts<CommandReturnType> = {
    requestId?: string;
    command: (logging?: (sql: string, timing?: number | undefined) => void ) => Promise<CommandReturnType>;
    commandName?: string;
};

export class BaseSequelizeRepo<
    ModelAttributes extends { id: string },
    ModelCreationAttributes extends Record<string, unknown>,
    CustomModel extends Model<ModelAttributes, ModelCreationAttributes>
> {
    public table: ModelStatic<CustomModel>;
    public tableName: string;
    public mapTableToDTO: (model: CustomModel) => ModelAttributes;
    private _logger: HotLogger | null;
    private _logQueries: boolean;

    constructor({ table, mapTableToDTO, logger }: IBaseSequelizeRepo<ModelAttributes, ModelCreationAttributes, CustomModel>) {
        if (!table) {
            const error = "Missing table model!";
            this._logger?.warn(error);
            throw new Error(error);
        }

        this.table = table;
        this.tableName = table.tableName || table.name;
        this.mapTableToDTO = mapTableToDTO;
        this._logger = logger?.enabled ? logger?.instance || HotLogger.createLogger(`@db/${this.tableName}`) : null;
        this._logQueries = !!logger?.enabled && !!logger.logQueries;
    }

    public commit = async <CommandReturnType>({ command, requestId, commandName }: CommonCommanderOpts<CommandReturnType>) => {
        const commandQuery: { query?: string; time?: number } = {};
        try {
            const res = await command((query, time) => {
                commandQuery.query = query;
                commandQuery.time = time;
            });

            if (this._logQueries) {
                this._logger?.info(`Executing ${this.tableName}.${commandName || "command"}`, {
                    requestId,
                    tableName: this.tableName,
                    ...commandQuery && commandQuery,
                    data: {
                        result: res
                    }
                });
            }

            return ok<CommandReturnType>(res);
        } catch (error) {
            this._logger?.error(`Error executing ${this.tableName}.${commandName || "command"}`, {
                err: <Error>error,
                requestId,
                tableName: this.tableName,
                ...commandQuery && commandQuery
            });
            return fail(error);
        }
    };

    public count = async ({ where, requestId }: { where?: WhereOptions<ModelAttributes>; requestId?: string }) => {
        return this.commit<number>({
            requestId,
            commandName: this.count.name,
            command: () => this.table.count({ where })
        });
    };

    public create = async ({ dto, transaction, requestId }: { dto: MakeNullishOptional<ModelCreationAttributes>; transaction?: Transaction; requestId?: string }) => {
        return this.commit({
            requestId,
            commandName: this.create.name,
            command: () => this.table.create(dto,
                { transaction })
                .then(r => r ? this.mapTableToDTO(r) : null)
        });
    };

    public update = async ({ dto, transaction, where, requestId }: {
        dto: MakeNullishOptional<ModelCreationAttributes>; where: WhereOptions<ModelAttributes>; transaction?: Transaction; requestId?: string; }) => {
        return this.commit<boolean>({
            requestId,
            commandName: this.update.name,
            command: () => this.table.update(dto,
                { where, transaction })
                .then(r => r[0] ? r[0] > 0 : false)
        });
    };

    public createBulk = async ({ dtos, transaction, requestId }: { dtos: (MakeNullishOptional<ModelCreationAttributes>)[]; transaction?: Transaction; requestId?: string }) => {
        const attributeKeys = Object.keys(this.table.getAttributes()).filter(key => key !== "id") as unknown as (keyof ModelAttributes)[];
        return this.commit({
            requestId,
            commandName: this.createBulk.name,
            command: (logging) => this.table.bulkCreate(dtos,
                {
                    transaction,
                    ignoreDuplicates: false,
                    updateOnDuplicate: attributeKeys,
                    returning: true,
                    logging
                })
                .then(r => r ? r.map(this.mapTableToDTO) : null)
        });
    };

    public getAll = async ({ requestId, order, where, limit }: { order?: Order; requestId?: string; where?: WhereOptions<ModelAttributes>; limit?: number } = {}) => {
        return this.commit<ModelAttributes[] | null>({
            requestId,
            commandName: this.getAll.name,
            command: () => this.table.findAll({ where, order, limit })
                .then(e => e.length ? e?.map(this.mapTableToDTO) : null)
        });
    };

    public getLast = async ({ requestId }: { requestId?: string } = {}) => {
        return this.commit<ModelAttributes | null>({
            requestId,
            commandName: this.getLast.name,
            command: () => this.table.findOne({ order: [["id", "DESC"]] })
                .then(r => r && this.mapTableToDTO(r))
        });
    };

    public getById = async ({ id, requestId }: { id: string; requestId?: string }) => {
        return this.commit<ModelAttributes | null>({
            requestId,
            commandName: this.getById.name,
            command: () => this.table.findOne({ where: <WhereOptions<ModelAttributes>>{ id } })
                .then(r => r && this.mapTableToDTO(r))
        });
    };

    public delById = async ({ id, requestId }: { id: string; requestId?: string }) => {
        return this.commit<number>({
            requestId,
            commandName: this.delById.name,
            command: () => this.table.destroy({ where: <WhereOptions<ModelAttributes>>{ id } })
        });
    };

    public delByIds = async ({ ids, requestId }: { ids: string[]; requestId?: string }) => {
        return this.commit<number>({
            requestId,
            commandName: this.delByIds.name,
            command: (logging) => this.table.destroy({ where: <WhereOptions<ModelAttributes>>{ id: { [Op.in]: ids } }, logging })
        });
    };

    public findOne = async ({ where, order, requestId }: { where: WhereOptions<ModelAttributes>; order?: Order; requestId?: string }) => {
        return this.commit<ModelAttributes | null>({
            requestId,
            commandName: this.findOne.name,
            command: (logging) => this.table.findOne({ where, order, logging })
                .then(r => r && this.mapTableToDTO(r))
        });
    };

}
