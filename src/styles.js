  import { css } from 'lit';

  const styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      max-width: 1128px;
      margin: 0 auto;
      text-align: center;
      border-radius: 20px;
      color: #fff;
      font-weight: 200;
          background-image: url("../assets/noisy.png");
          background-repeat: no-repeat;
          background-size: cover;
      }

    main {
      flex-grow: 1;
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-between
    }

    .main-container{
      height: 100%;
      width: 50%;
      margin: 20px;
    }

    .left-module {
      width: 100%;
      height: 45vh;
      margin: 6px;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(2px);
      border-radius: 20px;
      display: flex;
      font-weight: inherit;
      padding: 10px;
      text-align: center;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      h3 {
        font-weight: 200;
      }
    }

    #config-stream{
      flex-direction: column;
      justify-content: space-between;
      h3 {
        margin-bottom: 0;
      }
      #cube-render{
        height: 270px;
        width: 494px;
      }
    }

    .toolbar {
      border-radius: 20px;
      background-color: #1B1A1A;
      width: 90%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 55px;
      padding: 0px 15px;

      .config-section{
        display: flex;
        justify-content: space-between;
        width: 50%;
        align-items: center;
      }

      svg {
        cursor: pointer;
      }
    }

    #hand-container {
      height: 100vh;
      width: 50%;
      margin: 5px;
      #hand-three-js {
        position: relative;
        left: 7px;
        width: 100%;
        height: 100%;
      }

      canvas {
        display: block;
        width: 496px;
        height: 800px;
        position: relative;
        right: 12px;
        border-radius: 20px;
        bottom: 11px;
      }
      .model {
        height: 93%;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(2px);
        display: flex;
        font-weight: inherit;
        padding: 10px;
        text-align: center;
        justify-content: center;
        align-items: center;
        margin: 20px;
        flex-direction: column;
      }
      h3 {
        font-weight: 200;
      }

      button {
        width: 95px;
        padding: 0;
        span { width: 45px; }
      }
    }

    button {
      padding: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #53a449;
      font-weight: 300;
      border-radius: 18px;
      height: 30px;
      border: none;
      color: #fff;
      font-family: 'Inter';
      cursor: pointer;
    }

    #event-stream{
      div {
        font-family: monospace;
        text-align: left;
        width: 100%;
        max-height: 44vh;
        min-height: 44vh;
        overflow-y: auto;
        display:flex;
        flex-direction: column;
      }

      span {
        font-family: monospace;
        display: flex;
        justify-content: space-between;
      }
    }
  `;


  export default styles
