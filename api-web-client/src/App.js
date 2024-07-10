import {useState} from 'react';
import MainView from './components/classification/MainView';
import SignIn from './components/auth/SignIn';

const App = () => {
    // Current signed in user
    const [passcode, setPasscode] = useState(null);
    const [token, setToken] = useState(null);

    return (
        <div className="App">
            {/* PLEASE DO NOT TOUCH className WITHOUT CONSULTING A PROFESSIONAL */}
            {/* I MEAN IT */}
            <main className={passcode ? '' : 'plaster'}>
                {
                    // Check if user is signed in
                    passcode ? (
                        <MainView passcode={passcode} setPasscode={setPasscode} token={token} setToken={setToken}/>
                    ) : (
                        <SignIn passcode={passcode} setPasscode={setPasscode} token={token} setToken={setToken}/>
                    )
                }
            </main>
        </div>
    )
        ;
}

export default App;
