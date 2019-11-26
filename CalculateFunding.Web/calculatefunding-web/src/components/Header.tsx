import * as React from "react"

export class Header extends React.Component<{},{}>{
    render(){
        return <header role="banner" id="global-header" className="with-proposition">
            <div className="header-wrapper  container">
                <div className="header-global">
                    <div className="header-logo">
                        <div id="logo" className="content">
                            <img src="assets/images/gov.uk_logotype_crown_invert_trans.png" width="35" height="31"
                                 alt="" />GOV.UK
                        </div>
                    </div>
                </div>
                <div className="header-proposition">
                    <div className="content">
                        <a href="#proposition-links" className="js-header-toggle menu">Menu</a>
                        <nav id="proposition-menu">
                            <a href="/" id="proposition-name">Calculate Funding</a>
                            <div className="user-container">
                                <i className="material-icons circle-icon">person</i>
                                <span id="userName"></span>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    }
}