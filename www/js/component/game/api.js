// @flow

/* global window */

import appConst from '../../app-const';

type SymbolTicType = 'X';
type SymbolTacType = 'O';
type SymbolNoDefineType = '';

type SymbolMapType = {|
    +tic: SymbolTicType,
    +tac: SymbolTacType,
    +noDefine: SymbolNoDefineType
|};

export type ServerCellDataType = {
    +value: SymbolTicType | SymbolTacType | SymbolNoDefineType,
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
            async (response: Response): Promise<ServerCellDataType> => {
                const parsedResponse = await response.json();

                console.log('---> parsed response:', parsedResponse);

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
