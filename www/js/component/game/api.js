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

type ServerCellBalanceType = {
    // "address" : "3P6eC7TYNmT15Lw9UpeESDuYNcer78LFkg8",
    // "assetId" : "2",
    balance: number
};

async function getCellBalance(address: string, assertId: number): Promise<ServerCellBalanceType | null> {
    const getServerCellBalanceUrl = appConst.api.getServerCellBalance
        .replace('{address}', address)
        .replace('{assetId}', String(assertId + 1));

    return window
        .fetch(getServerCellBalanceUrl)
        .then((response: Response): Promise<ServerCellBalanceType> => response.json())
        .catch(
            (error: Error): null => {
                console.error('---> ERROR: can not get server cell data!');
                console.error(
                    `---> ERROR: address: ${address}, assertId: ${assertId}, url: ${getServerCellBalanceUrl}`
                );
                console.error(error);

                return null;
            }
        );
}

export async function getServerCellBalance(cellIndex: number): Promise<ServerCellDataType | null> {
    return await Promise.all([
        getCellBalance(appConst.address.symbolX, cellIndex),
        getCellBalance(appConst.address.symbolO, cellIndex)
    ])
        .then(
            (
                cellBalanceList: [ServerCellBalanceType | null, ServerCellBalanceType | null]
            ): ServerCellDataType | null => {
                const [cellX, cellO] = cellBalanceList;

                if (cellX === null || cellO === null) {
                    return null;
                }

                const balanceX = cellX.balance;
                const balanceO = cellO.balance;

                if (balanceX === 1) {
                    return {
                        value: symbolMap.tic,
                        index: cellIndex
                    };
                }

                if (balanceO === 1) {
                    return {
                        value: symbolMap.tac,
                        index: cellIndex
                    };
                }

                return {
                    value: symbolMap.noDefine,
                    index: cellIndex
                };
            }
        )
        .catch(
            (error: Error): null => {
                console.error(`---> ERROR: can not get server cell data! cellIndex: ${cellIndex}`);
                console.error(error);

                return null;
            }
        );
}
