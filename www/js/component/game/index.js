// @flow

/* global window, setTimeout */

/* eslint consistent-this: ["error", "view"] */

import type {Node} from 'react';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import type {GlobalStateType} from '../../app/app-reducer';
import style from './style.scss';
import {getCellListState, symbolMap} from './api';
import type {ServerCellDataType, SymbolType} from './api';
import Queue from '../../lib/queue';
import {getWinner, isAllCellFilled, isWinCell} from './helper';
import Button from '@material-ui/core/Button';
import Locale from '../locale';
import Cell from './cell';

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
    +cellStateList: Array<ServerCellDataType>,
    +gameResult: '' | 'END_GAME_RESULT__X_WIN' | 'END_GAME_RESULT__O_WIN' | 'END_GAME_RESULT__DRAW',
    +winCellList: Array<ServerCellDataType>
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
                .fill({value: symbolMap.noDefine, index: 0})
                .map((value: ServerCellDataType, index: number): ServerCellDataType => ({...value, index})),
            gameResult: '',
            winCellList: []
        };
    }

    isListenServerStart(): boolean {
        const view = this;
        const {props, state} = view;

        return state.isListenServerStart;
    }

    async fetchServerCellListData(): Promise<void> {
        const view = this;
        const {state} = view;
        const {cellStateList} = state;

        const serverCellStateList = await getCellListState();

        if (serverCellStateList instanceof Error) {
            return;
        }

        const newCellStateList = cellStateList.map(
            (cell: ServerCellDataType): ServerCellDataType => {
                return {...cell, value: serverCellStateList.cellList[cell.index]};
            }
        );

        view.setState({cellStateList: newCellStateList});

        console.log(serverCellStateList);
    }

    async startListenServer(): Promise<void> {
        const view = this;

        if (view.isListenServerStart()) {
            console.log('---> server already run');
            return;
        }

        view.setState(
            {isListenServerStart: true},
            async (): Promise<void> => {
                async function watch(): Promise<void> {
                    if (!view.isListenServerStart()) {
                        console.log('---> server is stop');
                        return;
                    }

                    await view.fetchServerCellListData();

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

    renderGameResult(): Node {
        const view = this;
        const {state} = view;
        const {gameResult} = state;

        if (gameResult === '') {
            return <p className={style.game_result_p}>&nbsp;</p>;
        }

        return (
            <button
                type="button"
                onClick={() => {
                    window.location.reload();
                }}
                onKeyPress={() => {
                    window.location.reload();
                }}
                className={style.game_result_button}
            >
                <Locale stringKey={gameResult}/>
            </button>
        );
    }

    render(): Node {
        const view = this;
        const {props, state} = view;
        const {isStarted, cellStateList, winCellList} = state;

        if (!isStarted) {
            return (
                <div className={style.wrapper}>
                    <Button
                        onClick={(): Promise<void> => view.startGame()}
                        onKeyPress={(): Promise<void> => view.startGame()}
                        variant="contained"
                        color="primary"
                        type="button"
                    >
                        <Locale stringKey="BUTTON__START_GAME"/>
                    </Button>
                </div>
            );
        }

        return (
            <div className={style.wrapper}>
                <div className={style.field}>
                    {cellStateList.map(
                        (cell: ServerCellDataType): Node =>
                            <Cell key={cell.index} value={cell.value} isWin={isWinCell(winCellList, cell)}/>

                    )}
                </div>
                {view.renderGameResult()}
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
