
class DataChannel {
    constructor(){}
    function closeDatachannel() {
        if (dataChannel) {
            dataChannel.removeEventListener('message', onMessage);
            dataChannel.close();
            dataChannel = null;
        }
    }
    
    function onMessage({ data }) {
        if (/^#START/.test(data)) {
            downloadStartTime = Date.now();
            const uploadDuration = data.split(' ')[1];
            const uploadBitRate = uploadedBytes*8/(uploadDuration/1000)/1000000;
            const text = `Upload &emsp;&emsp;-- total : ${uploadedBytes}, duration : ${uploadDuration} ms, bitrate : ~${uploadBitRate.toFixed(2)} Mbits/s`;
            uploadLabel.innerHTML = text;
            console.log(text);
    
            return;
        }
    
        if (/^#STOP/.test(data)) {
            downLoadDuration = Date.now() - downloadStartTime;
            const downloadBitRate = downloadedBytes*8/(downLoadDuration/1000)/1000000;
            const text = `Download -- total : ${downloadedBytes}, duration : ${downLoadDuration} ms, bitrate : ~${downloadBitRate.toFixed(2)} Mbits/s`;
            downloadLabel.innerHTML = text;
            console.log(text);
    
            peerConnection.close();
            closeDatachannel();
            resetButtons();
    
            return;
        }
    
        downloadedBytes += data.length;
    }
    
    
    function onDataChannel({ channel }) {
        if (channel.label !== 'datachannel-buffer-limits') {
          return;
        }
    
        uploadLabel.innerHTML = 'Upload &emsp;&emsp;-- ...';
        downloadLabel.innerHTML = 'Download -- ...';
    
        // Slightly delaying everything because Firefox needs it
        setTimeout(() => {
          dataChannel = channel;
          dataChannel.addEventListener('message', onMessage);
    
          const queueStartTime = Date.now();
          const chunkSizeInBytes = (chunkSize.value)*1024;
          const loops = uploadedBytes / chunkSizeInBytes;
          const rem = uploadedBytes % chunkSizeInBytes;
    
          try {
            dataChannel.send(`#START ${chunkSize.value}`);
    
            var data = new Array(chunkSizeInBytes + 1).join('.');
            for (let i = 0; i < loops; i++) {
              dataChannel.send(data);
            }
    
            if (rem) {
              dataChannel.send(data);
            }
    
            dataChannel.send('#STOP');
            const queueDuration = Date.now() - queueStartTime;
            console.log(`Queued ${uploadedBytes} bytes in ${queueDuration} ms`);
          } catch(e) {
            console.log('Failed to send data over dataChannel :', e);
            peerConnection.close();
            closeDatachannel();
            resetButtons();
            alert(e);
          }
        }, 200);
    }
    
    function onConnectionStateChange(event) {
        switch(peerConnection.connectionState) {
          case "disconnected":
          case "failed":
          case "closed":
            console.log('Received close event');
            closeDatachannel();
            break;
        }
    }
    
    peerConnection.addEventListener('connectionstatechange', onConnectionStateChange);
    peerConnection.addEventListener('datachannel', onDataChannel);
}