import { ReactElement } from 'react';
import AlignItem from '../../../Types/AlignItem';
import FieldType from '../../Types/FieldType';
import GenericObject from 'Common/Types/GenericObject';

export default interface Column<T extends GenericObject> {
    title: string;
    description?: string | undefined;
    disableSort?: boolean | undefined;
    tooltipText?: ((item: T) => string) | undefined;
    type: FieldType;
    colSpan?: number | undefined;
    noValueMessage?: string | undefined;
    contentClassName?: string | undefined;
    alignItem?: AlignItem | undefined;
    key?: string | null; //can be null because actions column does not have a key.
    getElement?:
        | ((
              item: T,
              onBeforeFetchData?: T | undefined
          ) => ReactElement)
        | undefined;
}
