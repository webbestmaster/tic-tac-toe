// @flow

/* global window */

import appConst from '../../app-const';

export type SymbolTicType = 'X';
export type SymbolTacType = 'O';
export type SymbolNoDefineType = '';
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
    tic: 'X',
    tac: 'O',
    noDefine: ''
};

export async function getServerCellData(cellIndex: number): Promise<ServerCellDataType | null> {
    const getServerCellDataUrl = appConst.api.getServerCellData;

    return window
        .fetch(getServerCellDataUrl)
        .then(
            async (response: Response): Promise<ServerCellDataType | null> => {
                const parsedResponse = await response.json();

                console.log('---> parsed response:', parsedResponse);

                if (Math.random() > 0.3) {
                    return null;
                }

                return {
                    value: Math.random() > 0.5 ? symbolMap.tic : symbolMap.tac,
                    index: cellIndex
                };
            }
        )
        .catch(
            (error: Error): null => {
                console.error(
                    `---> ERROR: can not get server cell data! cellIndex: ${cellIndex}, url: ${getServerCellDataUrl}`
                );
                console.error(error);

                return null;
            }
        );
}
