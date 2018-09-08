// @flow

/* global window */

import appConst from '../../app-const';

type SymbolMapType = {|
    +tic: 'X',
    +tac: 'O',
    +noDefine: ''
|};

export type ServerCellDataType = {
    +value: | $PropertyType<SymbolMapType, 'tic'>
        | $PropertyType<SymbolMapType, 'tac'>
        | $PropertyType<SymbolMapType, 'noDefine'>,
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
