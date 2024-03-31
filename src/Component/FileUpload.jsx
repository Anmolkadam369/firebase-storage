import React, {useState, useEffect} from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata } from 'firebase/storage';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadURL , setDownloadURL] = useState(null);
    const [uploadedFiles , setUploadedFiles] = useState([]);


    const firebaseConfig = {
        apiKey: "AIzaSyDVoCPjnHeVwhXGS6e2TecybfRA5kO47BM",
        authDomain: "firstfirebaseproject-c676f.firebaseapp.com",
        projectId: "firstfirebaseproject-c676f",
        storageBucket: "firstfirebaseproject-c676f.appspot.com",
        messagingSenderId: "490386883552",
        appId: "1:490386883552:web:629d36e63e41982abce185",
        measurementId: "G-R45S0BBB9B"
      };

      const app = initializeApp(firebaseConfig);
      const storage = getStorage(app);

      useEffect(()=>{
        fetchUploadedFiles();
      },[]);

    const fetchUploadedFiles = async () => {
        try {
            const storageRef = ref(storage);
            const filesList = await listAll(storageRef);

            const urls = await Promise.all(filesList.items.map(async (item) =>{
                const allURL = await getDownloadURL(item);
                const metadata = await getMetadata(item);
                const fileName = metadata.name;
                return {fileName,allURL}

            }));
            console.log(urls)
            setUploadedFiles(urls);
        } catch (error) {
            console.error('Error fetching uploaded files:', error);
        }
    }

    const handleFileChange = (e) => {
        if(e.target.files[0]) setFile(e.target.files[0]);
    }

    const handleUpload = () =>{
        if(file) {
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);
      
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes)*100);
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error(error);
                },
                ()=>{
                    getDownloadURL(uploadTask.snapshot.ref).then((url)=>{
                        console.log("file availble at", url);
                        setDownloadURL(url);
                        fetchUploadedFiles();
                    });
                }
            );
        }
    };

    return (
        <div>
            <h1>File Upload</h1>
            <input type='file' onChange={handleFileChange}/>
            <button onClick={handleUpload}>Upload</button>
            {uploadProgress > 0 && <progress value={uploadProgress} max='100' />}
            {downloadURL && <img src={downloadURL} alt="upload file"/>}

            <h2>Uploaded Files : </h2>
            {uploadedFiles.map((url,index)=>(
                <div key={index}>
                    <strong>File Name:</strong> {url.fileName}<br/>
                    <strong>File URL :</strong><a href={url.allURL} target='_blank' rel="noopener noreferrer">{url.allURL}</a><br/>
                    <strong>Download :</strong><a href={url.allURL} target='_blank' rel="noopener noreferrer">Download</a>
                    <hr />

                </div>
            ))}
        </div> 
    )
};

export default FileUpload;