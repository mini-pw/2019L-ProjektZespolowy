import React, {useContext, useState} from 'react';
import './App.css';
import BarWithDrawer from './Components/BarWithDrawer';
import {Route} from 'react-router-dom';
import PdfView from './Components/Pages/PdfView';
import PdfsList from './Components/Pages/PdfsList';
import {ServiceContext} from './Services/SeviceContext';
import PageTitleComponent from './Components/PageTitleComponent';


function App() {
  const {publicationsService, authService} = useContext(ServiceContext);
  const [username, setUsername] = useState(authService.username);
  const [searchParams, setSearchParams] = useState(null);
  authService.setUsernameChangeListener(setUsername);

  const routes = [
    {
      path: '/',
      exact: true,
      appbarText: () => () => 'Wybierz Publikację',
      main: () => <PdfsList username={username} searchParams={searchParams}/>
    },
    {
      path: '/paper/:id',
      appbarText: ({match}) => async () => {
        const publication = await publicationsService.getPublication(match.params.id);
        return <PageTitleComponent publication={publication} match={match}/>;
      },
      main: ({match, history}) => <PdfView username={username} match={match} history={history}/>
    }
  ];

  return (
    <div>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          render={(props) => <BarWithDrawer searchParams={searchParams} onSearch={setSearchParams} pageTitleLoader={route.appbarText(props)}/>}
        />
      ))}
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          component={route.main}
        />
      ))}
    </div>
  );
}

export default App;
