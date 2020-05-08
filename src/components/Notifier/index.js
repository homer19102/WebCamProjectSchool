import React, { Component } from "react";
import "./Notifier.css";
import classnames from 'classnames';

class Notifier extends Component {
  render() {
    const notifyclass = classnames('notify', {
      danger: this.props.offline
    });
    const message = this.props.offline ?
  `ConsoftCloudCam está offline! Parece que você perdeu sua conexão com a internet não se preocupe sua foto será salva até a conexão ser restabelecida`
  :
  `Tire uma foto e faça o upload para a nuvem da Consoft.`;
    return (
        <div className={notifyclass}>
            <p>
                <em>{message}</em>
            </p>
        </div>
    );
  }
}

export default Notifier;