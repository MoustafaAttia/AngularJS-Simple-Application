var myApp = angular.module('myApp', []);
var all_questions;
function readUTF8String(bytes) {
    var ix = 0;

    if (bytes.slice(0, 3) == "\xEF\xBB\xBF") {
        ix = 3;
    }

    var string = "";
    for (; ix < bytes.length; ix++) {
        var byte1 = bytes[ix].charCodeAt(0);
        if (byte1 < 0x80) {
            string += String.fromCharCode(byte1);
        } else if (byte1 >= 0xC2 && byte1 < 0xE0) {
            var byte2 = bytes[++ix].charCodeAt(0);
            string += String.fromCharCode(((byte1 & 0x1F) << 6) + (byte2 & 0x3F));
        } else if (byte1 >= 0xE0 && byte1 < 0xF0) {
            var byte2 = bytes[++ix].charCodeAt(0);
            var byte3 = bytes[++ix].charCodeAt(0);
            string += String.fromCharCode(((byte1 & 0xFF) << 12) + ((byte2 & 0x3F) << 6) + (byte3 & 0x3F));
        } else if (byte1 >= 0xF0 && byte1 < 0xF5) {
            var byte2 = bytes[++ix].charCodeAt(0);
            var byte3 = bytes[++ix].charCodeAt(0);
            var byte4 = bytes[++ix].charCodeAt(0);
            var codepoint = ((byte1 & 0x07) << 18) + ((byte2 & 0x3F) << 12) + ((byte3 & 0x3F) << 6) + (byte4 & 0x3F);
            codepoint -= 0x10000;
            string += String.fromCharCode(
                (codepoint >> 10) + 0xD800,
                (codepoint & 0x3FF) + 0xDC00
            );
        }
    }

    return string;
}


fileNameChanged = function (e) {
    var f = document.getElementById('uploadFile').files[0];
    var r = new FileReader();

    r.readAsBinaryString(f);

    r.onloadend = function (e) {
        var data = readUTF8String(e.target.result);
        var jsonObj = JSON.parse(data);
        all_questions = jsonObj;
    }
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

myApp.controller('myCntrl', function ($scope, $http) {
    $scope.selectedQ = {};
    $scope.disableAnswers = false;
    $scope.showExplain = false;
    $scope.questionsLoaded = false;
    $scope.showLanguage = false;
    $scope.disableLanguage = false;
    $scope.showScore = false;
    $scope.yourScore = 0;
    $scope.correctAnswers = 0;
    $scope.all_languages = ['python','c++'];
    $scope.selectedAnswer;
    $scope.Import = function () {
        $scope.questions = all_questions;
        alert("imported successfully, ## questions are imoprted".replace("##", $scope.questions.length));
        $scope.showLanguage = true;
        // calculate total score for each languages' questions
        $scope.totalCppScore = 0;
        $scope.totalPythonScore = 0;
        for (i = 0; i < $scope.questions.length; i++) {
            if ($scope.questions[i].ID < 1000) {
                $scope.totalPythonScore += parseInt($scope.questions[i].Score);
            }
            else {
                $scope.totalCppScore += parseInt($scope.questions[i].Score);
            }
        }
    }
    $scope.GetNextQuestion = function () {
        if ($scope.questions) {
            $scope.disableAnswers = false;
            $scope.showExplain = false;
            $scope.yourAnswer = '';
            $scope.selectedAnswer = '';
            $scope.currentQuestion += 1;

            if ($scope.language == "python" && $scope.startQuestion > 62) {
                document.getElementById("questionTitle").innerHTML = '<font size="5" color="green">Congrats all python questions solved !</font> ';
                $scope.questionsLoaded = false;
                $scope.showScore = true;
                $scope.selectedQ.Choices = [];
                $scope.selectedQ.Score = 0;
                $scope.currentQuestion = 0;
            }
            else if ($scope.language == "c++" && $scope.startQuestion > 135) {
                document.getElementById("questionTitle").innerHTML = '<font size="5" color="green">Congrats all c++ questions solved !</font> ';
                $scope.questionsLoaded = false;
                $scope.showScore = true;
                $scope.selectedQ.Choices = [];
                $scope.selectedQ.Score = 0;
                $scope.currentQuestion = 0;
            }
            else {
                $scope.selectedQ = $scope.questions[$scope.startQuestion];
                if ($scope.selectedQ == undefined) return;
                $scope.selectedQ.Choices = $scope.selectedQ.Choices.split('~');
                document.getElementById("questionTitle").innerHTML = replaceAll($scope.selectedQ.Title, '~', '<br />');

                $scope.startQuestion += 1;
            }

        }
        else {
            alert("Import questions first !");
        }
    }
    $scope.$watch('language', function () {
        $scope.currentQuestion = 0;
        if ($scope.language == 'python') {
            $scope.startQuestion = 0;
            $scope.totalQuestions = 63;
            $scope.disableLanguage = true;
            $scope.questionsLoaded = true;
        }
        else if ($scope.language == 'c++') {
            $scope.startQuestion = 63;
            $scope.totalQuestions = 73;
            $scope.disableLanguage = true;
            $scope.questionsLoaded = true;
        }
    });
    $scope.Solve = function () {
        if ($scope.selectedQ) {
            if ($scope.selectedAnswer == '') {
                alert('Select answer !');
                return;
            }
            else if ($scope.selectedAnswer == $scope.selectedQ.Answer) {
                $scope.yourAnswer = "correct answer";
                $scope.yourScore += parseInt($scope.selectedQ.Score);
                $scope.correctAnswers += 1;
            }
            else {
                $scope.yourAnswer = "wrong answer !";
            }
            $scope.disableAnswers = true;
            $scope.showExplain = true;
        }
        else {
            alert("No question selected !");
        }
    }
});