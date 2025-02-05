import * as React from 'react';
export default function Step( {step, num} ){
return (
    <div className={"step-div"}>
        <h2>Step {num}</h2>
        <p>{step}</p>
    </div>
        )
}