import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseModel from './BaseModel';
import ColumnLength from '../Types/Database/ColumnLength';
import ColumnType from '../Types/Database/ColumnType';
import Project from './Project';
import ObjectID from '../Types/ObjectID';
import Version from '../Types/Version';
import SlugifyColumn from '../Types/Database/SlugifyColumn';
import URL from '../Types/API/URL';
import User from './User';
import TableColumn from '../Types/Database/TableColumn';
import CrudApiEndpoint from '../Types/Database/CrudApiEndpoint';
import Route from '../Types/API/Route';
import TableColumnType from '../Types/Database/TableColumnType';

@CrudApiEndpoint(new Route('/probe'))
@SlugifyColumn('name', 'slug')
@Entity({
    name: 'Probe',
})
export default class Probe extends BaseModel {
    @TableColumn({
        required: true,
        unique: true,
        type: TableColumnType.ObjectID,
    })
    @Column({
        type: ColumnType.ObjectID,
        nullable: false,
        unique: true,
        length: ColumnLength.ObjectID,
        transformer: ObjectID.getDatabaseTransformer(),
    })
    public key?: ObjectID;

    @TableColumn({ required: true, type: TableColumnType.Name })
    @Column({
        nullable: false,
        type: ColumnType.Name,
        length: ColumnLength.Name,
    })
    public name?: string = undefined;

    @TableColumn({ required: true, unique: true, type: TableColumnType.Slug })
    @Column({
        nullable: false,
        type: ColumnType.Slug,
        length: ColumnLength.Slug,
    })
    public slug?: string = undefined;

    @TableColumn({ required: true, type: TableColumnType.Version })
    @Column({
        nullable: false,
        type: ColumnType.Version,
        length: ColumnLength.Version,
        transformer: Version.getDatabaseTransformer(),
    })
    public probeVersion?: Version;

    @TableColumn({
        isDefaultValueColumn: true,
        required: true,
        type: TableColumnType.Date,
    })
    @Column({
        nullable: false,
        default: () => {
            return 'CURRENT_TIMESTAMP';
        },
        type: ColumnType.Date,
    })
    public lastAlive?: Date = undefined;

    @TableColumn({ type: TableColumnType.ShortURL })
    @Column({
        type: ColumnType.ShortURL,
        nullable: true,
        length: ColumnLength.ShortURL,
        transformer: URL.getDatabaseTransformer(),
    })
    public iconUrl?: URL;

    // If this probe is custom to the project and only monitoring reosurces in this project.
    @TableColumn({ type: TableColumnType.Entity })
    @ManyToOne(
        (_type: string) => {
            return Project;
        },
        {
            cascade: false,
            eager: false,
            nullable: true,
            onDelete: 'CASCADE',
            orphanedRowAction: 'nullify',
        }
    )
    @JoinColumn({ name: 'projectId' })
    public project?: Project;

    @TableColumn({ type: TableColumnType.ObjectID })
    @Column({
        type: ColumnType.ObjectID,
        nullable: true,
        transformer: ObjectID.getDatabaseTransformer(),
    })
    public projectId?: ObjectID;

    @TableColumn({ type: TableColumnType.Entity })
    @ManyToOne(
        (_type: string) => {
            return User;
        },
        {
            cascade: false,
            eager: false,
            nullable: true,
            onDelete: 'CASCADE',
            orphanedRowAction: 'nullify',
        }
    )
    @JoinColumn({ name: 'deletedByUserId' })
    public deletedByUser?: User;

    @TableColumn({ type: TableColumnType.ObjectID })
    @Column({
        type: ColumnType.ObjectID,
        nullable: true,
        transformer: ObjectID.getDatabaseTransformer(),
    })
    public deletedByUserId?: ObjectID;

    @TableColumn({ type: TableColumnType.ObjectID })
    @ManyToOne(
        (_type: string) => {
            return User;
        },
        {
            eager: false,
            nullable: true,
            onDelete: 'CASCADE',
            orphanedRowAction: 'nullify',
        }
    )
    @JoinColumn({ name: 'createdByUserId' })
    public createdByUser?: User;

    @TableColumn({ type: TableColumnType.ObjectID })
    @Column({
        type: ColumnType.ObjectID,
        nullable: true,
        transformer: ObjectID.getDatabaseTransformer(),
    })
    public createdByUserId?: ObjectID;
}
