// @flow

/* global BUILD_DATE */

/* eslint consistent-this: ["error", "view"] */

import type {Node} from 'react';
import React, {Component} from 'react';
import type {ContextRouterType} from '../../type/react-router-dom-v4';
import Game from '../../component/game';
import style from './style.scss';

type PropsType = {
    ...$Exact<ContextRouterType>
};

// eslint-disable-next-line react/prefer-stateless-function
export default class Home extends Component<void, null> {
    props: PropsType;
    state: null;

    render(): Node {
        const view = this;
        const {props, state} = view;

        console.log(props, state);

        return [
            <header className={style.header} key="header">
                %the blockchain technology for game development%
            </header>,
            <Game key="game"/>
        ];
    }
}
