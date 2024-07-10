import {useEffect, useState} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import './MainView.css';
import Tweet from './Tweet';
import FeatureButton from './FeatureButton';

const MainView = ({passcode, setPasscode, token, setToken}) => {



    const [isSalafi, setSalafi] = useState(false);

    const [tweet, setTweet] = useState({
        tweetId: 'ERROR',
        tweetText: 'ERROR - Please contact the maintainers',
        username: 'JohnWickUK',
    });
    const [classifiyCount, setClassifyCount] = useState(0);
    const [featuresDetails, setFeaturesDetails] = useState([]);

    // Enable tooltips
    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-toggle="tooltip"]');
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, []);


    // Get features on component mount
    useEffect(() => {
        if (featuresDetails.length > 0) {
            return;
        }
        fetch(window.API_URL + '/params_list', {
            method: "GET", headers: {
                "Content-Type": "application/json",
            }
        }).then(response => {
            if (response.ok) {
                response.json().then(resj => {
                    const featuresDetails_l = resj.map(feature => {
                        return {
                            key: feature[0],
                            description: feature[1],
                            checked: false,
                        }
                    });
                    setFeaturesDetails(featuresDetails_l);
                });
            }
        });
    }, []);

    const updateCount = () => {
        fetch(window.API_URL + '/count_classifications', {
            method: "GET", headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            }
        }).then(response => {

            if (response.ok) {
                response.json().then(resj => {
                    setClassifyCount(resj.count);
                });
            }
        });
    }

    const signOut = () => {

        setPasscode(null);
        setToken(null);
    }

    const getNewTweet = async () => {
        // Get new tweet from server and set tweet state
        fetch(window.API_URL + '/get_tweet', {
            method: "GET", headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            }
        }).then(response => {

            // If response is ok, get new tweet and set tweet state
            if (response.ok) {
                response.json().then(resj => {
                    // If response contains: 'error': 'No unclassified tweets'
                    // The second check is to make sure toast is displayed only once
                    if (resj.error && tweet.tweetId !== 'ERROR') {
                        if (resj.error === 'No unclassified tweets') {
                            toast.error("No unclassified tweets", {
                                position: toast.POSITION.TOP_RIGHT,
                                autoClose: 2000
                            });
                        } else {
                            toast.error("Error getting new tweet", {
                                position: toast.POSITION.TOP_RIGHT,
                                autoClose: 2000
                            });
                        }
                        setTweet({
                            tweetId: 'ERROR',
                            tweetText: 'ERROR - Please contact the maintainers',
                            username: 'JohnWickUK',
                        });
                        return;
                    }
                    // Create tweet object
                    const tweet_l = {
                        tweetId: resj.id,
                        tweetText: resj.content,
                        username: resj.tweeter,
                    };
                    // Set tweet state
                    setTweet(tweet_l);
                });
            }
        });
    }

    // Get new tweet on component mount
    useEffect(() => {
        getNewTweet();
        updateCount();
    }, []);

    const resetFeatures = () => {
        // Reset features
        const featuresDetails_l = featuresDetails.map(feature => {
            return {
                key: feature.key,
                description: feature.description,
                checked: false,
            }
        });
        setFeaturesDetails(featuresDetails_l);
    }

    const submitClassification = async (classification, features_l) => {
        // Send classification to server
        fetch(window.API_URL + '/classify_tweet', {

            method: "POST", headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            }, body: JSON.stringify(
                {
                    tweet_id: tweet.tweetId,
                    classification: classification,
                    features: JSON.stringify(features_l),
                })
        }).then(response => {
            if (response.ok) {
                toast.success("Classification sent successfully", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000
                });

                // Get new tweet
                getNewTweet();
                // Update classification count
                updateCount();
            } else {
                toast.error("Error sending classification", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000
                });
            }
        });
    }

    const clearForm = () => {
        // Clear form
        document.getElementById("flexSwitchCheckDefault").checked = false;
        setSalafi(false);
        // Reset features
        resetFeatures();
    }

    const notSureClick = () => {
        // Send a not sure classification to server
        submitClassification("Unknown", null);
        // Clear form
        clearForm();
    }

    const irrelevantClick = () => {
        // Send an irrelevant classification to server
        submitClassification("Irrelevant", null);

        // Clear form
        clearForm();
    }

    const getFeaturesObj = () => {
        // Get checked features
        const features_l = featuresDetails.filter((feature) => feature.checked);
        // Get all features keys
        const featuresKeys = featuresDetails.map((feature) => feature.key);
        // Create features object
        const featuresObj = {};
        featuresKeys.forEach((key) => {
            featuresObj[key] = false;
        });
        // Set features to true
        features_l.forEach((feature) => {
            featuresObj[feature.key] = true;
            if(feature.key==="2a94"){
                featuresObj[feature.key] = feature.checked;
            }
             if(feature.key==="e3cc"){
                featuresObj[feature.key] = feature.checked;
            }

        });
        return featuresObj;
    }


    const handleSubmit = async (e) => {
  e.preventDefault();
  //from the iirelvent cheak
  resetFeatures();
  const isSalafi_l = document.getElementById("flexSwitchCheckDefault").checked;
  const classification = isSalafi_l ? "Positive" : "Negative";
//    const featuresObj = isSalafi_l ? getFeaturesObj() : null;
  const featuresObj = getFeaturesObj();
  const features_l = featuresDetails.filter((feature) => feature.checked);
  const level1 = ["a157","9347","9796","2a94","1fe1","c6b4","31fc","5ea7","e6fc","29f9","ef5f","f96d","8d23","40ee","bd93","744e","005d"];
  const level2 = ["3114", "5774", "6807", "7342", "9075","a57f", "61b8", "1e0d", "f6df", "ba22", "f822","0c09","e3cc"];
  const level3 = [ '7770', '0c09', '639c', 'af5c', 'ebf4', 'a952', '9b97', 'a40f', '1ba8', 'db56', '797e', '8abf', '6f4c', '656f', 'a936', '35a1', '54f9', '5bb2', '46df', 'a897', 'b7f2', '6dfe', 'df20', 'aa4d']
  let f1 = 0;
  let f2 = 0;
  let f3 = 0;
  let f4 = 0;
  let f5 = 0;
  let f6 =0;
  for (const index in features_l) {
    const f = features_l[index];

    if (f.key === "3cf8" && f.checked) {
      f1 = 1;
    }

    if (f.key === "5619" && f.checked) {
      f2 = 1;
    }

    if (f.key === "1cd7" && f.checked) {
      f3 = 1;
    }

    if (level1.includes(f.key) && f.checked) {
      f4 = 1;
    }

    if (level2.includes(f.key) && f.checked) {
      f5 = 1;
    }
     if (level3.includes(f.key) && f.checked) {
      f6 = 1;
    }
  }

  let good = 1;

  if (f1 === 1 && f2 === 1 && f3 === 1) {
    good = 0;
  }
if ((f1 === 0 && f2 === 0 && f3 === 0 )&& isSalafi_l  ) {
    good = 0;
  }
if ((f1 === 1 || f2 === 1 || f3 === 1 )&& !isSalafi_l  ) {
    good = 0;
  }

  if (f2 === 1 && f3 === 1) {
    good = 0;
  }

  if (f1 === 1 && f3 === 1) {
    good = 0;
  }

  if (f2 === 1 && f1 === 1) {
    good = 0;
  }

  if ((f2 === 1 || f3 === 1) && f4 === 1) {
    good = 0;
  }

  if (f3 === 1 && (f4 === 1 || f5 === 1)) {
    good = 0;
  }


  if (good === 1) {
    clearForm();
    // Send classification to server
    submitClassification(classification, featuresObj);
  }
}

    const setFeature = (feature, bool) => {
        setFeaturesDetails((prevFeatures) => {
            const index = prevFeatures.findIndex((f) => f.key === feature.key);
            const updatedFeatures = [...prevFeatures];
            updatedFeatures[index] = {
                ...updatedFeatures[index],
                checked: bool,
            };
            return updatedFeatures;
        });
    };


    return (
        <>
            <div id="form-frame" className="form-class">
                <h1 className="form-title">Classify</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Tweet tweet={tweet}/>
                        <p className="classify-count">Classifications made: {classifiyCount}</p>
                        <br/>
                        <div className="form-check form-switch form-switch-md">
                            <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault"
                                   onChange={() => setSalafi(!isSalafi)}/>

                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
                                {isSalafi ? "Relrvent" : "Non-Relrvent"}
                            </label>
                        </div>
                    </div>

                    <div className="classification-zone">
                        <div>
                            <div className="classify-container">
                                <button
                                    type="submit" id="classify-btn"
                                    className="submit-button classify-submit-button">Classify
                                </button>
                            </div>
                            <button id="not-sure-btn" className="small-side-button" type="button"
                                    onClick={notSureClick}>
                                <span className="bi bi-question-square-fill"/>
                                <span style={{paddingLeft: "3%"}}/>
                                <span>Uncertain</span>
                            </button>
                            <span style={{paddingLeft: "2%"}}/>

                        </div>
                    </div>

                </form>
                <br/>
                <div className="form-question">
                    <a href="" onClick={signOut}>Sign Out</a>
                </div>
            </div>
            <ToastContainer/>
            <div className="button-containerr">
                <div className="features-container">
                    {featuresDetails.map((feature, index) => (
                        <FeatureButton
                            key={index}
                            id={index}
                            feature={feature}
//                            disabled={!isSalafi}
                            setFeature={setFeature}

                        />
                    ))}
                </div>
            </div>
        </>
    );
}

export default MainView;


//                            <button id="irrelevant-btn" className="small-side-button" type="button"
//                                    onClick={irrelevantClick}>
//                                <span className="bi bi-trash-fill"/>
//                                <span style={{paddingLeft: "3%"}}/>
//                                <span>Irrelevant</span>
//                            </button>