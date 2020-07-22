var answer;
var score=0;
var backgroundImages=[];


function nextQuestion(){
    const n1=Math.floor(Math.random() * 5);
    document.getElementById('n1').innerHTML=n1;
    const n2=Math.floor(Math.random() * 6);
    document.getElementById('n2').innerHTML=n2;
    answer=n1+n2;
}

function checkAnswer(){
    var prediction=predictImage();
    console.log(`prediction :${prediction} , answer : ${answer}`);

    if(prediction == answer){
       
        if(score < 6){
            score++;
            backgroundImages.push(`url('images/background${score}.svg')`);
            document.body.style.backgroundImage=backgroundImages;
        }else{
            alert('congratulations you made it. restart Quiz ?');
            score=0;
            backgroundImages=[];
            document.body.style.backgroundImage=backgroundImages;
        }
        
    }else{
        if(score != 0){
            score--;
            setTimeout(function(){
                
                backgroundImages.pop();
                document.body.style.backgroundImage=backgroundImages;
                alert('OOPS !!!  check your calculation. Try writing clearly!');

            },100);
        }
       
    }
}