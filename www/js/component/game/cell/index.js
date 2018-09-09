// @flow

/* eslint consistent-this: ["error", "view"] */

import type {Node} from 'react';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import type {GlobalStateType} from '../../../app-reducer';
import type {ContextRouterType} from '../../../type/react-router-dom-v4';
import style from './style.scss';
import type {SymbolType} from '../api';
import {getImagePath} from './helper';
import {symbolMap} from '../api';
import classNames from 'classnames';

type ReduxPropsType = {
    // +reduxProp: boolean
};

type ReduxActionType = {
    // +setSmth: (smth: string) => string
};

type PassedPropsType = {|
    +value: SymbolType,
    +isWin: boolean
    // +passedProp: string
|};

type PropsType = $ReadOnly<$Exact<{
        ...$Exact<PassedPropsType>,
        ...$Exact<ReduxPropsType>,
        ...$Exact<ReduxActionType>
        // ...$Exact<ContextRouterType>,
        // +children: Node
    }>>;

type StateType = {
    // +state: number
};

const reduxAction: ReduxActionType = {
    // setSmth // imported from actions
};

class Cell extends Component<ReduxPropsType, PassedPropsType, StateType> {
    props: PropsType;
    state: StateType;

    constructor(props: PropsType) {
        super(props);

        const view = this;

        view.state = {};
    }

    render(): Node {
        const view = this;
        const {props, state} = view;

        return (
            <div className={style.cell}>
                <img className={style.cell_bg} src={getImagePath(symbolMap.noDefine)} alt=""/>
                <div className={classNames(style.cell_value, {[style.cell_win]: props.isWin})}>
                    <img className={style.cell_value} src={getImagePath(props.value)} alt=""/>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: GlobalStateType, props: PassedPropsType): ReduxPropsType => ({
        // reduxProp: true
    })
    // reduxAction
)(Cell);
