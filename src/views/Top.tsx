import {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';
import './Top.css';

function Top() {
    const [pages, setPages] = useState<string[]>([]);

    useEffect(() => {
        axios.get(`https://w1ki-demo-backend-739333860791.asia-northeast2.run.app/`)
            .then(response => {
                console.log('ページ一覧:', response.data);
                setPages(response.data);
            })
            .catch(error => {
                console.error('ページ一覧エラー:', error);
            })
    }, []);


    return (
        <div className="pages-container">
            <div className="top-section-title">Welcome to w1ki!</div>
            <p style={{textAlign: "center"}}>
                w1kiとは、同期編集機能を持つmarkdownベースのシンプルなウィキエンジンです。<br/>
                現在開発中。
            </p>
            <div className="top-section-title">記事一覧</div>
            <ul className="pages-list">
                {pages.map((page, index) =>
                    <Link to={"/view/" + page}>
                        <li key={index}>
                            {page}
                        </li>
                    </Link>
                )}
            </ul>
        </div>
    )
}

export default Top
