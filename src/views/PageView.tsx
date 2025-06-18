import React from 'react'
import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { getApiUrl, getWsUrl } from '../config/api';
import './PageView.css'
import './editorStyles.css'

function PageView()  {
    const urlParams = useParams<{ title: string }>()
    const [markdown, setMarkdown] = useState<string>("");
    const [editorMode, setEditorMode] = useState<boolean>(false);
    const socketRef = useRef<WebSocket | null>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const websocket = new WebSocket(getWsUrl(`/ws/${urlParams.title}`));
        socketRef.current = websocket;
        const onMessage = (event: MessageEvent<string>) => {
            const messageType = event.data.split(":")[0];
            const messageContent = event.data.split(":")[1];
            handleEditorCommunication(messageType, messageContent)
        }
        websocket.addEventListener("message", onMessage);
        return () => {
            websocket.close()
            websocket.removeEventListener('message', onMessage);
        }
    }, [editorMode])

    React.useEffect(() => {
        handleLoad(urlParams.title || "");
        setEditorMode(false);
    }, [urlParams.title])

    function sendMarkdwonToOthers(newMarkdown?: string) {
        setMarkdown((markdown) => {
            const value = newMarkdown ? newMarkdown : markdown
            socketRef.current?.send(value);
            console.log(value);
            return value;
        })
    }

    function handleEditorCommunication(messageType: string, messageContent: string) {
        setEditorMode((editorMode) => {
            if (!editorMode) {
                return editorMode
            }

            if (messageType === "Message") {
                setMarkdown(messageContent);
            } else if (messageType === "NewConnection") {
                console.log("編集中のmarkdownを送信")
                sendMarkdwonToOthers();
            } else if (messageType === "Connections") {
                console.log("接続者数:" + messageContent)
            }
            return editorMode
        })
    }

    const reloadRoot = useCallback(() => {
        navigate("/");
    }, []);

    function handleSubmit(title: string, markdown: string) {
        const post = { title, markdown };
        axios.post(getApiUrl(`/page/${title}`), post)
            .then(response => {
                console.log('記事保存:', response.data);
            })
            .catch(error => {
                console.error('記事保存エラー:', error);
            });
    }

    function handleLoad(title: string) {
        if(title !== "") {
            axios.get(getApiUrl(`/page/${title}`))
                .then(response => {
                    console.log('記事読み込み:', response.data);
                    if(response.data) {
                        setMarkdown(response.data);
                    } else {
                        setMarkdown("## " + title + "\n---");
                    }
                })
                .catch(error => {
                    console.error('記事読み込みエラー:', error);
                })
        }
    }

    function handleDelete() {
        if(urlParams.title === "") {
            alert("title undefined");
        } else if(confirm("ページを削除しますか？")) {
            axios.delete(getApiUrl(`/page/${urlParams.title}`))
                .then(response => {
                    console.log('記事削除:', response.data);
                    reloadRoot();
                })
                .catch(error => {
                    alert("記事削除エラー");
                    console.error('記事削除エラー:', error);
                })
        }
    }

    function editorView() {
        return  (
            <div className="editor-container">
                <div className="preview">
                    <Markdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                    </Markdown>
                </div>
                <textarea
                    className="editor"
                    value={markdown}
                    onChange={(e) => {
                        const newMarkdown = e.target.value;
                        setMarkdown(newMarkdown);
                        sendMarkdwonToOthers(newMarkdown)
                    }}
                    placeholder="Enter text here"
                />
            </div>
        )
    }

    function articleView() {
        return (
            <>
                <div className="article">
                    <Markdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                    </Markdown>
                </div>
            </>
        )
    }


    return (
        <div className="page-view-container">
            {/*<h1 id="title">{urlParams.title}</h1>*/}
            <div id="editPage">
                <div className="action-buttons">
                    {/*<button className="action-button" onClick={() => handleLoad(urlParams.title || "")}>読み込み</button>*/}
                    <button
                        className="action-button"
                        id="modeSwith"
                        onClick={() => {
                            if(editorMode) {
                                handleSubmit(urlParams.title|| "", markdown)
                            }
                            setEditorMode(!editorMode)
                        }}
                    >
                        {editorMode ? '編集完了' : '編集'}
                    </button>
                    {editorMode ?
                        <>
                        <button
                            className="action-button"
                            id="cancelEdit"
                            onClick={() => {
                                handleLoad(urlParams.title || "")
                                setEditorMode(false)
                            }}
                        >
                            編集をキャンセル
                        </button>
                        <button
                            className="action-button"
                            id="deleteButton"
                            onClick={() => {
                                handleDelete()
                            }}
                        >
                            ページを削除
                        </button>
                        </>
                        : <></>
                    }
                </div>

                {editorMode ? editorView() : articleView()}
            </div>
        </div>
    )

}

export default PageView
