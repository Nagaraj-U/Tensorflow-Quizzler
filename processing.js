var model; //using model globally

async function loadModel(){
    model=await tf.loadGraphModel('TFJS/model.json');
  }


  function predictImage(){
      //console.log('processing ...')
      //reading image from canvas
      let image=cv.imread(canvas);
      //converting to grey scale
      cv.cvtColor(image,image,cv.COLOR_RGBA2GRAY,0);
      //increasing constrast
      cv.threshold(image,image,175,255,cv.THRESH_BINARY);
      //finding countours(outlines of image)
      let contours=new cv.MatVector();
      let hierarchy=new cv.Mat();  
      cv.findContours(image,contours,hierarchy,cv.RETR_CCOMP,cv.CHAIN_APPROX_SIMPLE);

      //finding bounding rectangles
      let cnt=contours.get(0);
      let rect=cv.boundingRect(cnt);
      image=image.roi(rect);  //roi : region of interest

      //resizing image 20 pixels
      var height=image.rows;
      var width=image.cols;

      if(height>width){
        height=20;
        let scaleFactor=image.rows/height;
        width=Math.round(image.cols/scaleFactor);
      }else{
        width=20;
        let scaleFactor=image.cols/width;
        height=Math.round(image.rows/scaleFactor);
      }

      let newSize=new cv.Size(width,height);
      cv.resize(image,image,newSize,0,0,cv.INTER_AREA)

      //add padding to image
      const LEFT=Math.ceil(4+(20-width)/2);
      const RIGHT=Math.floor(4+(20-width)/2);
      const TOP=Math.ceil(4+(20-height)/2);
      const BOTTOM=Math.floor(4+(20-height)/2);

      const BLACK=new cv.Scalar(0,0,0,0);
      cv.copyMakeBorder(image,image,TOP,BOTTOM,LEFT,RIGHT,cv.BORDER_CONSTANT,BLACK);

      //Center of mass
      cv.findContours(image,contours,hierarchy,cv.RETR_CCOMP,cv.CHAIN_APPROX_SIMPLE);
      cnt=contours.get(0);
      const Moments=cv.moments(cnt,false);

      const cx=Moments.m10/Moments.m00;
      const cy=Moments.m01/Moments.m00;

      //shifting image according to center of mass
      const X_SHIFT=Math.round(image.cols/2 - cx);
      const Y_SHIFT=Math.round(image.rows/2 - cy);
      newSize=new cv.Size(image.cols,image.rows);

      const M=cv.matFromArray(2,3,cv.CV_64FC1,[1,0,X_SHIFT,0,1,Y_SHIFT]);
      cv.warpAffine(image,image,M,newSize,cv.INTER_LINEAR,cv.BORDER_CONSTANT,BLACK);


      //normalizing pixel values
      let pixelValues=image.data; //(0 - 255)
      //console.log(`pixel values : ${pixelValues}`); //before normalize

      pixelValues=Float32Array.from(pixelValues);

      pixelValues=pixelValues.map(function(item){  // (0 - 1)
        return item/255.0;
      });

     // console.log(`normalized pixel values : ${pixelValues}`);

      const X =tf.tensor([pixelValues]);
      // console.log(`shape of tensor : ${X.shape}`);
      // console.log(`datatype of tensor : ${X.dtype}`)


      //VERIFYING BY DRAWING CANVAS BELOW BODY
      // const outputCanvas=document.createElement('CANVAS');
      // cv.imshow(outputCanvas,image);
      // document.body.appendChild(outputCanvas);

      var result = model.predict(X);
      result.print();

      const output=result.dataSync()[0];

      

      //cleanup
      contours.delete();
      image.delete();
      cnt.delete();
      hierarchy.delete();
      M.delete();
      result.dispose();
      X.dispose();

      return output;
      
  }