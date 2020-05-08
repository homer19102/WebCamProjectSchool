import React, { Component } from 'react';
import { Webcam } from '../../webcam';
import './ClCamera.css';
import axios from 'axios';

class ClCamera extends Component {
  constructor() {
    super();
    this.webcam = null;
    this.state = {
      capturedImage: null,
      captured: false,
      uploading: false
    }
  }

  componentDidMount() {
    // inicializa a camera
    this.canvasElement = document.createElement('canvas');
    this.webcam = new Webcam(
        document.getElementById('webcam'),
        this.canvasElement
    );
    this.webcam.setup().catch(() => {
        alert('Erro ao acessar sua WebCam');
    });
  }


  componentDidUpdate(prevProps) {
    if (!this.props.offline && (prevProps.offline === true)) {
      // if online
      this.batchUploads();
    }
  }

  render() {
        const imageDisplay = this.state.capturedImage ?
            <img src={this.state.capturedImage} alt="captured" width="350" />
            :
            <span />;

        const buttons = this.state.captured ?
            <div>
                <button className="deleteButton" onClick={this.discardImage} > Delete  </button>
                <button className="captureButton" onClick={this.uploadImage} > Upload </button>
            </div> :
            <button className="captureButton" onClick={this.captureImage} > Tirar Foto </button>

        const uploading = this.state.uploading ?
            <div><p> Realizando o upload, favor aguardar ... </p></div>
            :
            <span />

        return (
            <div>
                {uploading}
                <video autoPlay playsInline muted id="webcam" width="100%" height="200" />
                <br />
                <div className="imageCanvas">
                    {imageDisplay}
                </div>
                {buttons}
            </div>
        )
    }

    captureImage = async () => {
        const capturedData = this.webcam.takeBase64Photo({ type: 'jpeg', quality: 0.8 });
        this.setState({
            captured: true,
            capturedImage: capturedData.base64
        });
    }

    discardImage = () => {
        this.setState({
            captured: false,
            capturedImage: null
        })
    }

    uploadImage = () => {
        if (this.props.offline) {
            console.log("Você está utilizando o modo offline");
            // random string para o nome da foto
            const prefix = 'cloudy_pwa_';
            // cria uma string random
            const rs = Math.random().toString(36).substr(2, 5);
            localStorage.setItem(`${prefix}${rs}`, this.state.capturedImage);
            alert('Não se preocupe sua foto foi salva localmente, e o upload será realizado automaticamente assim que a conexão for reestabelecida');
            this.discardImage();
            // salva a imagem localmente
        } else {
            this.setState({ 'uploading': true });
            axios.post(
                `https://api.cloudinary.com/v1_1/dsukdt3l8/image/upload`,
                {
                    file: this.state.capturedImage,
                    upload_preset: 'CLOUDINARY_CLOUD_PRESET'
                }
            ).then((data) => this.checkUploadStatus(data)).catch((error) => {
                alert('Desculpe, encontramos um erro ao realizar o upload da sua imagem');
                this.setState({ 'uploading': false });
            });
        }
    }
    findLocalItems = (query) => {
        let i;
        let results = [];
        for (i in localStorage) {
            if (localStorage.hasOwnProperty(i)) {
                if (i.match(query) || (!query && typeof i === 'string')) {
                    const value = localStorage.getItem(i);
                    results.push({ key: i, val: value });
                }
            }
        }
        return results;
    }

    checkUploadStatus = (data) => {
        this.setState({ 'uploading': false });
        if (data.status === 200) {
            alert('Sua imagem foi salva em nossa base de dados com sucesso !');
            this.discardImage();
        } else {
            alert('Desculpe, houve um erro ao enviar sua foto a nossa base de dados');
        }
    }

    batchUploads = () => {
        // pega as imagens locais para upload
        const images = this.findLocalItems(/^cloudy_pwa_/);
        let error = false;
        if (images.length > 0) {
            this.setState({ 'uploading': true });
            for (let i = 0; i < images.length; i++) {
                // upload
                axios.post(
                    `https://api.cloudinary.com/v1_1/dsukdt3l8/image/upload`,
                    {
                        file: images[i].val,
                        upload_preset: 'CLOUDINARY_CLOUD_PRESET'
                    }

                ).then(
                  (data) => this.checkUploadStatus(data)
                ).catch((error) => {
                    error = true;
                })
            }
            this.setState({ 'uploading': false });
            if (!error) {
                alert("Sua imagem foi salva em nossa base de dados com sucesso !");
            }
        }
    }
}

export default ClCamera;