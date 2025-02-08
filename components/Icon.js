import * as React from 'react';
export default function Icon({children, clickEvent, href, className="", btnText="Click Me"}) {
    let classes = "icon-btn " + className
    if (href){
        return (
            <button className={classes}>
                <a href={href}>
                    <div className={"icon-div"}>{children}</div>
                    <span>{btnText}</span>
                </a>
            </button>
        );
    }
    return (
        <button className={classes} onClick={clickEvent}>
            <div className={"icon-div"}>{children}</div>
            <span>{btnText}</span>
        </button>
    );
}