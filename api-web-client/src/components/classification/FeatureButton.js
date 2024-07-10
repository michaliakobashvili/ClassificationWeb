import "./FeatureButton.css";
import React, { useState } from 'react';

const FeatureButton = ({ feature, disabled, setFeature }) => {

    const [description, setDescription] = useState('');
    const handleChange = (event) => {
    setDescription(event.target.value);
    console.log(event.target.value)
    clickedOther()
  };

    // TODO : check if the feature is "other" and then
    const clicked = (bool) => {
        if (disabled) return;
        // Set the feature to the new value
        setFeature(feature, bool);

    };
    const clickedOther = () => {
        if (disabled) {
            setFeature(feature, false);
            return;}
        // Set the feature to the new value
        setFeature(feature, description);


    };


    const getClassName = () => {
        let newClsName = "bi bi-";
        newClsName += feature.checked ? "check" : "x";
        newClsName += "-circle-fill feature-mark ";
        if (feature.checked) {
            newClsName += `feature-mark-checked${disabled ? "-disabled" : ""}`;
        }
        else {
            newClsName += `feature-mark-unchecked${disabled ? "-disabled" : ""}`;
        }
        return newClsName;
    }


    if((feature.description==="add words level 1" || feature.description==="add words level 2")){
        return (
        <div className={`feature-row ${disabled ? 'feature-row-disabled' : ""}`} onClick={() => clickedOther(!feature.checked)}>
            <input
                type="text"
                placeholder="other"
                disabled={false} // Always enabled, or remove entirely if not needed
                value={description}
                className="feature-button"
                onChange={handleChange}
            />
            <div className="button-container">
                <i
                    className={getClassName()}
                ></i>
            </div>
        </div>
        );
    }
    else if(feature.key==="5619" || feature.key==="3cf8"|| feature.key==="1cd7"){
        return (
            <div className={`feature-row ${disabled ? 'feature-row-disabled' : ""}`}
                 onClick={() => clicked(!feature.checked)}>
                <button
                    type="button"
                    disabled={disabled}
                    className="feature-button"
                >
                    <h5> {feature.description}</h5>
                </button>
                <div className="button-container">
                    <i
                        className={getClassName()}
                    ></i>
                </div>
                <br/>
                <br/>
            </div>

        );
    }
    return (
        <div className={`feature-row ${disabled ? 'feature-row-disabled' : ""}`} onClick={() => clicked(!feature.checked)}>
            <button
                type="button"
                disabled={disabled}
                className="feature-button"
            >
                {feature.description}
            </button>
            <div className="button-container">
                <i
                    className={getClassName()}
                ></i>
            </div>
        </div>
    );
};

export default FeatureButton;