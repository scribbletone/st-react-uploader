# Scribble Tone React Uploader

React drag and drop file uploader for internal Scribble Tone usage. Feel free to use, but no promises that it'll work ;)


## Install

`npm install --save st-react-uploader`

## Usage

```
import {FileUploader} from 'st-react-uploader';

...

<FileUploader
  name='name_of_your_field'
  autoUpload={false}
  awsCredentials={{
    access_key_id: 'your key id',
    acl: 'private',
    policy: 'your base64 encoded policy',
    signature: 'your generated signature'
  }}
  bucketUrl={AppVars.s3TempBucketUrl}
  buildUid={true}
  onSuccess={(r)=>{console.log('success', r)}}
  submitBtnClass='btn'
/>

...

```

## Notes
- Policy and signature should probably be generated server side and passed in. See `s3-authorize` gem for ruby.
