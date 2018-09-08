// @flow

/* global window */

import appConst from '../../app-const';

export type ServerCellDataType = {
    +value: 'X' | 'O' | '',
    +index: number
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
                    value: Math.random() > 0.5 ? 'X' : 'O',
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
