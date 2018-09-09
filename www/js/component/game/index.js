// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "view"] */

import type {Node} from 'react';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import type {GlobalStateType} from '../../app-reducer';
import type {ContextRouterType} from '../../type/react-router-dom-v4';
import style from './style.scss';
import homePageStyle from '../../page/home/style.scss';
import {getServerCellData, symbolMap} from './api';
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

    // eslint-disable-next-line  max-statements
    async fetchServerCellData(cellIndex: number): Promise<void> {
        const view = this;
        const {state} = view;
        const {cellStateList} = state;

        const serverCellData = await getServerCellData(cellIndex);

        if (serverCellData === null) {
            console.error('---> Error: Can not get cell, cellIndex:', cellIndex);
            return;
        }

        cellStateList[cellIndex] = serverCellData;

        view.setState({cellStateList});

        const activeSymbolList = [symbolMap.tic, symbolMap.tac];

        const winnerData = getWinner(cellStateList, activeSymbolList);

        await new Promise((resolve: () => void) => {
            // time to animate cell drawing
            setTimeout(resolve, 500);
        });

        if (winnerData !== null) {
            view.setState({
                gameResult: winnerData.value === symbolMap.tic ? 'END_GAME_RESULT__X_WIN' : 'END_GAME_RESULT__O_WIN',
                winCellList: winnerData.cellList
            });
            console.log('---> winner is:', winnerData);
            view.stopListenServer();
            return;
        }

        if (isAllCellFilled(cellStateList, activeSymbolList)) {
            console.log('---> DRAW');
            view.setState({gameResult: 'END_GAME_RESULT__DRAW'});
            view.stopListenServer();
            return;
        }

        console.log('---> no winner and battlefield is not fulfill -> game must go on');
    }

    async fetchServerCellListData(): Promise<void> {
        const view = this;
        const {state} = view;
        const {cellStateList} = state;

        const queue = new Queue();

        cellStateList.forEach((cellData: ServerCellDataType, cellIndex: number) => {
            if (cellData.value) {
                console.log(`---> value for cellIndex: ${cellIndex} already exists, request no needed`);
                return;
            }

            queue.push(
                async (): Promise<void> => {
                    if (!view.isListenServerStart()) {
                        console.log('no fetch, server listen is stop');
                        return;
                    }

                    await view.fetchServerCellData(cellIndex);
                }
            );
        });

        return new Promise((resolve: () => void) => {
            queue.push(resolve);
        });
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

    componentDidMount() {
        const view = this;

        view.startGame();
    }

    render(): Node {
        const view = this;
        const {props, state} = view;
        const {isStarted, cellStateList, gameResult, winCellList} = state;

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
                <p className={homePageStyle.header}>
                    {gameResult === '' ? '\u00A0' : <Locale stringKey={gameResult}/>}
                </p>
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
