// @flow

import type {SymbolType} from '../api';
import {symbolMap} from '../api';
import noDefineImage from './i/empty.svg';
import ticImage from './i/x.svg';
import tacImage from './i/o.svg';

export function getImagePath(imageName: SymbolType): string {
    switch (imageName) {
        case symbolMap.tic:
            return ticImage;
        case symbolMap.tac:
            return tacImage;
        case symbolMap.noDefine:
            return noDefineImage;
        default:
            console.error('can not get image for imageName:', imageName);
    }

    return noDefineImage;
}
