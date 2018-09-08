// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "view"] */

import type {Node} from 'react';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import type {GlobalStateType} from '../../app-reducer';
import type {ContextRouterType} from '../../type/react-router-dom-v4';
import style from './style.scss';
import {getServerCellData} from './api';
import type {ServerCellDataType} from './api';

type ReduxPropsType = {};

type ReduxActionType = {};

type PassedPropsType = {};

type PropsType = $ReadOnly<$Exact<{
        ...$Exact<PassedPropsType>,
        ...$Exact<ReduxPropsType>,
        ...$Exact<ReduxActionType>,
        // ...$Exact<ContextRouterType>,
        +children: Node
    }>>;

type StateType = {|
    +isStarted: boolean,
    +isListenServerStart: boolean,
    +cellStateList: Array<ServerCellDataType>
|};

const reduxAction: ReduxActionType = {
    // setSmth // imported from actions
};

const serverListenPerion = 1e3;

class Game extends Component<ReduxPropsType, PassedPropsType, StateType> {
    props: PropsType;
    state: StateType;

    constructor(props: PropsType) {
        super(props);

        const view = this;

        view.state = view.getInitialState();
    }

    getInitialState(): StateType {
        return {
            isStarted: false,
            isListenServerStart: false,
            // did not find better way to create needed array, fix it if you can
            cellStateList: new Array(9)
                .fill({value: '', index: 0})
                .map((value: ServerCellDataType, index: number): ServerCellDataType => ({...value, index}))
        };
    }

    isListenServerStart(): boolean {
        const view = this;
        const {props, state} = view;

        return state.isListenServerStart;
    }

    async startListenServer(): Promise<void> {
        const view = this;

        if (view.isListenServerStart()) {
            console.log('---> server already run');
            return;
        }

        view.setState(
            {isListenServerStart: true},
            (): Promise<void> => {
                async function watch(): Promise<void> {
                    if (!view.isListenServerStart()) {
                        console.log('---> server is stop');
                        return;
                    }

                    const {cellStateList} = view.state;

                    cellStateList.forEach(
                        async (cellData: ServerCellDataType, cellIndex: number): Promise<void> => {
                            if (cellData.value) {
                                console.log(`---> value for cellIndex: ${cellIndex} already exists, request no needed`);
                                return;
                            }

                            const serverCellData = await getServerCellData(cellIndex);

                            if (serverCellData === null) {
                                console.error('---> Error: Can not get cell, cellIndex:', cellIndex);
                                return;
                            }

                            cellStateList[cellIndex] = serverCellData;
                            view.setState({cellStateList});
                        }
                    );

                    setTimeout(watch, serverListenPerion);
                }

                return watch();
            }
        );
    }

    stopListenServer() {
        const view = this;

        view.setState({isListenServerStart: false});
    }

    componentWillUnmount() {
        const view = this;

        view.stopListenServer();
    }

    async startGame(): Promise<void> {
        const view = this;

        view.setState({isStarted: true});

        await view.startListenServer();
    }

    render(): Node {
        const view = this;
        const {props, state} = view;
        const {isStarted, cellStateList} = state;

        if (!isStarted) {
            return (
                <button
                    onClick={(): Promise<void> => view.startGame()}
                    onKeyPress={(): Promise<void> => view.startGame()}
                    type="button"
                >
                    %start game%
                </button>
            );
        }

        return (
            <div>
                {cellStateList.map(
                    (cell: ServerCellDataType): Node => {
                        return (
                            <div key={cell.index} className={style.cell}>
                                {cell.value}
                            </div>
                        );
                    }
                )}
            </div>
        );
    }
}

export default connect(
    (state: GlobalStateType, props: PassedPropsType): ReduxPropsType => ({
        // reduxProp: true
    }),
    reduxAction
)(Game);
