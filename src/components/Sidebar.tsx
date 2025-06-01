import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css';

function Sidebar() {
    const [pages, setPages] = React.useState<string[]>([]);

    useEffect(() => {
        axios.get("http://localhost:8080/")
            .then(response => {
                console.log('ページ一覧:', response.data);
                setPages(response.data);
            })
            .catch(error => {
                console.error('ページ一覧エラー:', error);
            })
    }, [])

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>w1ki</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li key="0">
                        <Link to="/">TOP</Link>
                    </li>
                    <li key="1">
                        <Link to="/view">新規作成</Link>
                    </li>
                    {pages.map((page, index) =>
                            <li key={index + 2}>
                                <Link to={"/view/" + page}>
                                {page}
                                </Link>
                            </li>
                    )}
                </ul>
            </nav>

        </div>
    );
}

export default Sidebar;
