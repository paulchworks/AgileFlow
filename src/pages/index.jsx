import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Projects from "./Projects";

import Team from "./Team";

import SprintBoard from "./SprintBoard";

import Backlog from "./Backlog";

import ProjectDetails from "./ProjectDetails";

import Epics from "./Epics";

import Issues from "./Issues";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Projects: Projects,
    
    Team: Team,
    
    SprintBoard: SprintBoard,
    
    Backlog: Backlog,
    
    ProjectDetails: ProjectDetails,
    
    Epics: Epics,
    
    Issues: Issues,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Team" element={<Team />} />
                
                <Route path="/SprintBoard" element={<SprintBoard />} />
                
                <Route path="/Backlog" element={<Backlog />} />
                
                <Route path="/ProjectDetails" element={<ProjectDetails />} />
                
                <Route path="/Epics" element={<Epics />} />
                
                <Route path="/Issues" element={<Issues />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}