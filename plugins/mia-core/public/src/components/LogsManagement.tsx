// deps

    // externals
    import React from "react";
    import {
        Alert,
        Card, CardHeader, CardBody, CardFooter,
        InputTextLabel, SelectLabel,
        ButtonGroup, Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";
    import downloadTextFile from "../utils/downloadTextFile";
    import { canPurgeLogs } from "../utils/userPermissions";
    import { CurrentUserContext } from "./CurrentUserProvider";
    import LogsPurgeModal from "./LogsPurgeModal";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../Descriptor";

    type User = components["schemas"]["User"];
    type LogLevel = components["schemas"]["LogLevel"];

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "loading": boolean;
        "logs": string | null;
        "from": string;
        "to": string;
        "level": "" | LogLevel;
        "limit": string;
        "purgeOpened": boolean;
    }

// consts

    const LEVELS: LogLevel[] = [
        "critical",
        "error",
        "warning",
        "success",
        "info",
        "debug"
    ];

    const ONE_DAY: number = 24 * 60 * 60 * 1000;

// private

    function _pad (value: number): string {
        return value.toString().padStart(2, "0");
    }

    // "datetime-local" inputs only understand a local "YYYY-MM-DDTHH:mm" value
    function _formatRangeBound (date: Date): string {

        return date.getFullYear() + "-" + _pad(date.getMonth() + 1) + "-" + _pad(date.getDate())
            + "T" + _pad(date.getHours()) + ":" + _pad(date.getMinutes());

    }

    function _parseRangeBound (bound: string): string | null {

        const date: Date = new Date(bound);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date.toISOString();

    }

// component

export default class LogsManagement extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "LogsManagement";

        public static contextType: typeof CurrentUserContext = CurrentUserContext;

        declare public context: React.ContextType<typeof CurrentUserContext>;

    // constructor

    public constructor (props: iProps) {

        super(props);

        const now: Date = new Date();

        this.state = {
            "loading": true,
            "logs": null,
            "from": _formatRangeBound(new Date(now.getTime() - ONE_DAY)),
            "to": _formatRangeBound(now),
            "level": "",
            "limit": "",
            "purgeOpened": false
        };

    }

    public componentDidMount (): void {

        getSDK().getLogsLimits().then((limits: { "oldest": string; "newest": string }): void => {

            this.setState({
                "loading": false,
                "from": _formatRangeBound(new Date(limits.oldest)),
                "to": _formatRangeBound(new Date(limits.newest))
            });

        }).catch((err: Error): void => {

            this.setState({
                "loading": false
            });

            this.props.onError(err);

        });

    }

    // private

    private _loadLogs (): void {

        const from: string | null = _parseRangeBound(this.state.from);
        const to: string | null = _parseRangeBound(this.state.to);

        if (null === from || null === to) {

            this.setState({
                "loading": false,
                "logs": null
            });

            this.props.onError(new Error("Please enter a valid date range."));

            return;

        }

        this.setState({
            "loading": true
        });

        this._requestLogs(from, to).then((logs: string): void => {

            this.setState({
                "loading": false,
                "logs": logs
            });

        }).catch((err: Error): void => {

            this.setState({
                "loading": false,
                "logs": null
            });

            this.props.onError(err);

        });

    }

    private _requestLogs (from: string, to: string): Promise<string> {

        const limit: number = Number(this.state.limit);
        const hasLimit: boolean = "" !== this.state.limit && Number.isFinite(limit) && 0 < limit;
        const omitted: { "level"?: LogLevel } = {};

        // "all levels" must not send any "level" filter
        if (hasLimit) {
            return getSDK().getLogs(from, to, "" === this.state.level ? omitted.level : this.state.level, limit);
        }

        return "" === this.state.level
            ? getSDK().getLogs(from, to)
            : getSDK().getLogs(from, to, this.state.level);

    }

    // interface handlers

    private readonly _handleChangeFrom = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "from": value
        });

    };

    private readonly _handleChangeTo = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "to": value
        });

    };

    private readonly _handleChangeLevel = (e: React.ChangeEvent<HTMLSelectElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "level": value as "" | LogLevel
        });

    };

    private readonly _handleChangeLimit = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "limit": value
        });

    };

    private readonly _handleLoad = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this._loadLogs();

    };

    private readonly _handleExport = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        if (null === this.state.logs || "" === this.state.logs) {
            return;
        }

        downloadTextFile(
            this.state.logs,
            "mia-logs-" + this.state.from.replace(/:/g, "-") + "-" + this.state.to.replace(/:/g, "-") + ".log"
        );

    };

    private readonly _handleOpenPurge = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "purgeOpened": true
        });

    };

    private readonly _handleClosePurge = (e?: React.MouseEvent<HTMLButtonElement>): void => {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setState({
            "purgeOpened": false
        });

    };

    private readonly _handlePurged = (): void => {

        this._loadLogs();

    };

    // render

    public render (): React.JSX.Element {

        const me: User | null = this.context.user;
        const fromIso: string | null = _parseRangeBound(this.state.from);
        const toIso: string | null = _parseRangeBound(this.state.to);
        const rangeValid: boolean = null !== fromIso && null !== toIso;
        const hasLogs: boolean = null !== this.state.logs && "" !== this.state.logs;
        const showPurge: boolean = Boolean(me && canPurgeLogs(me));

        return <>

            { this.state.purgeOpened && null !== fromIso && null !== toIso && <LogsPurgeModal
                from={ fromIso }
                to={ toIso }
                onClose={ this._handleClosePurge }
                onPurged={ this._handlePurged }
                onError={ this.props.onError }
            /> }

            <Card>

                <CardHeader>Logs</CardHeader>

                <CardBody>

                    <div className="row">

                        <div className="col-12 col-md-3">
                            <InputTextLabel id="logs-from" label="From" type="datetime-local"
                                disabled={ this.state.loading }
                                value={ this.state.from } onChange={ this._handleChangeFrom }
                            />
                        </div>

                        <div className="col-12 col-md-3">
                            <InputTextLabel id="logs-to" label="To" type="datetime-local"
                                disabled={ this.state.loading }
                                value={ this.state.to } onChange={ this._handleChangeTo }
                            />
                        </div>

                        <div className="col-12 col-md-3">
                            <SelectLabel id="logs-level" label="Level"
                                disabled={ this.state.loading }
                                value={ this.state.level } onChange={ this._handleChangeLevel }
                            >

                                <option value="">All levels</option>

                                { LEVELS.map((level: LogLevel): React.JSX.Element => {
                                    return <option key={ level } value={ level }>{ level }</option>;
                                }) }

                            </SelectLabel>
                        </div>

                        <div className="col-12 col-md-3">
                            <InputTextLabel id="logs-limit" label="Max records" type="number"
                                disabled={ this.state.loading }
                                placeholder="10000 when empty"
                                value={ this.state.limit } onChange={ this._handleChangeLimit }
                            />
                        </div>

                    </div>

                    <Button title="Load logs"
                        icon="sync" variant="primary" block
                        disabled={ this.state.loading || !rangeValid }
                        onClick={ this._handleLoad }
                    >
                        Load logs
                    </Button>

                </CardBody>

                { this.state.loading && <CardBody><Alert variant="info">Loading logs...</Alert></CardBody> }

                { !this.state.loading && hasLogs && <CardBody>
                    <pre className="mb-0 overflow-auto" style={ { "maxHeight": "50vh", "whiteSpace": "pre-wrap" } }>
                        { this.state.logs }
                    </pre>
                </CardBody> }

                <CardFooter>

                    <ButtonGroup block>

                        <Button title="Export logs"
                            icon="save" variant="success"
                            disabled={ this.state.loading || !hasLogs }
                            onClick={ this._handleExport }
                        >
                            Export
                        </Button>

                        { showPurge && <Button title="Purge logs"
                            icon="trash" variant="danger"
                            disabled={ this.state.loading || !rangeValid }
                            onClick={ this._handleOpenPurge }
                        >
                            Purge
                        </Button> }

                    </ButtonGroup>

                </CardFooter>

            </Card>

        </>;

    }

}
