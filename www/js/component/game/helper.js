// @flow

import type {ServerCellDataType, SymbolType} from './api';

export type GetWinnerType = {|
    +winner: SymbolType,
    +cellList: Array<ServerCellDataType>
|};

function getLine(cellList: Array<ServerCellDataType>, lineIndex: number): Array<ServerCellDataType> | null {
    switch (lineIndex) {
        case 0:
            return [cellList[0], cellList[1], cellList[2]];
        case 1:
            return [cellList[3], cellList[4], cellList[5]];
        case 2:
            return [cellList[6], cellList[7], cellList[8]];

        case 3:
            return [cellList[0], cellList[3], cellList[6]];
        case 4:
            return [cellList[1], cellList[4], cellList[7]];
        case 5:
            return [cellList[2], cellList[5], cellList[8]];

        case 6:
            return [cellList[0], cellList[4], cellList[8]];
        case 7:
            return [cellList[2], cellList[4], cellList[6]];
        default:
            console.error('can not find line index', lineIndex);
    }

    return null;
}

function isNeededLine(line: Array<ServerCellDataType>, winnerType: SymbolType): boolean {
    if (line.length === 0) {
        return false;
    }

    return line.every((item: ServerCellDataType): boolean => item.value === winnerType);
}

export function getWinner(cellList: Array<ServerCellDataType>, winnerList: Array<SymbolType>): GetWinnerType | null {
    let result: GetWinnerType | null = null;

    const itemListList = new Array(8).fill(null).map(
        (value: null, item: number): Array<ServerCellDataType> | null => {
            return getLine(cellList, item);
        }
    );

    winnerList.every(
        (winnerTypeInList: SymbolType): boolean => {
            const neededLine =
                itemListList.find(
                    (line: Array<ServerCellDataType> | null): boolean => {
                        if (line === null) {
                            return false;
                        }

                        return isNeededLine(line, winnerTypeInList);
                    }
                ) || null;

            if (neededLine === null) {
                return true;
            }

            result = {
                winner: winnerTypeInList,
                cellList: neededLine
            };

            return false;
        }
    );

    return result;
}
