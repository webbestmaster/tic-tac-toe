// @flow

/* global window */

import appConst from '../../app/const';

export type SymbolTicType = 1;
export type SymbolTacType = 10;
export type SymbolNoDefineType = 0;
export type SymbolType = SymbolTicType | SymbolTacType | SymbolNoDefineType;

type SymbolMapType = {|
    +tic: SymbolTicType,
    +tac: SymbolTacType,
    +noDefine: SymbolNoDefineType
|};

export type ServerCellDataType = {
    +value: SymbolType,
    +index: number
};

export const symbolMap: SymbolMapType = {
    tic: 1,
    tac: 10,
    noDefine: 0
};

type CellStateType = SymbolType;
type CellStateListType = {|
    +cellList: Array<CellStateType>
|};

type RawServerCellDataType = {key: mixed, value: mixed};

function extractCellList(parsedResponse: Array<RawServerCellDataType>): Array<SymbolType> {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
        // eslint-disable-next-line complexity
        (cellName: number): CellStateType => {
            const cell =
                parsedResponse.find(
                    (cellInList: RawServerCellDataType): boolean => cellInList.key === `cell${cellName}`
                ) || null;

            if (cell === null) {
                console.error(`Can not find cell with key = cell${cellName}`);
                return symbolMap.noDefine;
            }

            const {value} = cell;

            if (value === symbolMap.noDefine) {
                return symbolMap.noDefine;
            }

            if (value === symbolMap.tic) {
                return symbolMap.tic;
            }
            if (value === symbolMap.tac) {
                return symbolMap.tac;
            }

            console.error('cell.value is not support', cell);

            return symbolMap.noDefine;
        }
    );
}

export async function getCellListState(): Promise<CellStateListType | Error> {
    return window
        .fetch(appConst.api.cellStateList)
        .then((response: Response): Promise<Array<RawServerCellDataType>> => response.json())
        .then(
            (parsedResponse: Array<RawServerCellDataType>): CellStateListType => {
                return {
                    cellList: extractCellList(parsedResponse)
                };
            }
        )
        .catch(
            (error: Error): Error => {
                console.error('can not get cell state list');
                console.error(error);
                return error;
            }
        );
}
