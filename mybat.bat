@ECHO OFF 

set NODE_VER=null
set S_NODE_VAR=7
node -v >tmp.txt
set /p NODE_VER=<tmp.txt
del tmp.txt
rem echo %NODE_VER%
set NODE_VAR_INT=%NODE_VER:~1,1%
rem echo %NODE_VAR_INT%

IF %NODE_VER% NEQ null (
echo %NODE_VER%

	IF %NODE_VAR_INT% GEQ %S_NODE_VAR% (
		echo NodeJs version is compatible
		node index.js
	) else (
		echo NodeJs version is not compatible, Install NodeJs 7 or above
		pause
	)
 
) ELSE (
	echo NodeJs in not installed, Install NodeJs 7 or above
	pause
)

