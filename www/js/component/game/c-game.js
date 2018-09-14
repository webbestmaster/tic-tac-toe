// @flow

/* global window, setTimeout */

/* eslint consistent-this: ["error", "view"] */

import type {Node} from 'react';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import type {GlobalStateType} from '../../app/reducer';
import style from './style.scss';
import type {ServerCellDataType} from './api';
import {getCellListState, symbolMap} from './api';
import {getWinner, isAllCellFilled, isWinCell, readFileFromInput} from './helper';
import Button from '@material-ui/core/Button';
import Locale from '../locale/c-locale';
import Cell from './cell/c-cell';
import type {AuthType, UserType} from '../auth/reducer';
import type {SetUserType} from '../auth/action';
import {setUser} from '../auth/action';

const WavesAPI = require('@waves/waves-api');

type ReduxPropsType = {|
    +auth: AuthType
|};

type ReduxActionType = {|
    +setUser: (userState: UserType) => SetUserType
|};

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
    setUser
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
    }

    checkWinner() {
        const view = this;
        const {state} = view;
        const {cellStateList} = state;
        const activeSymbolList = [symbolMap.tic, symbolMap.tac];

        const winnerData = getWinner(cellStateList, activeSymbolList);

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

                    view.checkWinner();

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
        const {auth, setUser: setUserAction} = props;

        if (!isStarted) {
            return (
                <div className={style.wrapper}>
                    <Button
                        // onClick={(): Promise<void> => view.startGame()}
                        // onKeyPress={(): Promise<void> => view.startGame()}
                        variant="contained"
                        color="primary"
                        type="button"
                    >
                        <Locale stringKey="BUTTON__LOAD_FILE"/>
                        <input
                            onInput={(evt: SyntheticEvent<HTMLInputElement>) => {
                                readFileFromInput(evt.currentTarget.files[0])
                                    .then((text: string) => {
                                        makeTest(text);
                                    })
                                    .catch(
                                        (error: Error): Error => {
                                            console.error('can not read file');
                                            console.error(error);
                                            return error;
                                        }
                                    );
                            }}
                            className={style.input_file}
                            type="file"
                        />
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
        auth: state.auth
    }),
    reduxAction
)(Game);

async function makeTest(text: string): Promise<void> {
    const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);
    const seed = Waves.Seed.fromExistingPhrase(text);

    const data = [
        {
            key: 'cell1',
            value: 10,
            type: 'integer'
        },
        {
            key: 'deadline',
            value: Date.now() + 1e3,
            type: 'integer'
        }
    ];

    // const dataTxObj = Object.assign(Helpers.TX_EXAMPLES.DATA, {
    const dataTxObj = Object.assign(
        {},
        {
            data,
            fee: await Waves.tools.getMinimumDataTxFee(data) + 400000,
            sender: seed.address,
            senderPublicKey: seed.keyPair.publicKey
        }
    );

    const dataTx = await Waves.tools.createTransaction(Waves.constants.DATA_TX_NAME, dataTxObj);

    dataTx.addProof(seed.keyPair.privateKey);

    const dataTxJSON = await dataTx.getJSON();
    const dataTxResult35 = await Waves.API.Node.transactions.rawBroadcast(dataTxJSON);

    console.log(dataTxResult35);
}
