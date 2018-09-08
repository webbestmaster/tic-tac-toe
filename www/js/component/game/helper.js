// @flow

import type {ServerCellDataType} from './api';

export type GetWinnerType<WinnerType> = {|
    +winner: WinnerType,
    +cellList: Array<number>
|};

function getLine<LineType>(cellList: Array<LineType>, lineIndex: number): Array<LineType> | null {
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

export function getWinner<WinnerType>(
    cellList: Array<ServerCellDataType>,
    winnerList: Array<WinnerType>
): GetWinnerType<WinnerType> | null {
    return (
        winnerList.find(
            (winnerType: WinnerType): boolean => {
                return false;
            }
        ) || null
    );
}
