import * as React from 'react';
export default function Icon({children, clickEvent=()=>{}, href, btnClass="", btnText="Click Me"}) {
    let classes = "icon-btn " + btnClass;
    let newClass = getComputedStyle(document.documentElement).getPropertyValue('--icon-btn-visibility');
    if (typeof newClass === "string") {
        classes += (newClass === "true" ? " icons-visible" : " icons-hidden");
    }
    if (href){
        return (
            <a href={href}>
            <button className={classes}>
                    <div className={"icon-div"}>{children}</div>
                    <span>{btnText}</span>
            </button>
            </a>
        );
    }
    return (
        <button className={classes} onClick={clickEvent}>
            <div className={"icon-div"}>{children}</div>
            <span>{btnText}</span>
        </button>
    );
}