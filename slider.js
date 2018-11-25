app.directive("slider", function () {
    return {
        link: function (scope, elem, attr) {
            scope.elem = elem[0];
			scope.config = {IsMulti : attr["isRange"] === "true"};
			scope.maxAllowedSelections = attr["maxAllowedSelections"] === undefined ? 99999 : parseInt(attr["maxAllowedSelections"]);
        },
        scope:true,
        template:
            '<div ng-controller="scrollController" class="srocll_container" ng-class="$parent.$parent.item.Name + $parent.item.Name + \'_srocll_container\'" ng-click="$event.stopPropagation();">'
            + '<div class="srocll_container_inner vertical_center" ng-class="$parent.$parent.item.Name + $parent.item.Name + \'_srocll_container_inner\'" ng-mousemove="mouseMove($event)" ng-mouseup="mouseDown(false)" ng-mouseleave="mouseDown(false)" ng-style="sliderStyle">'
                + '<div class="rail vertical_center">'
                    + '<div class="thumb thumb_left vertical_center" ng-mousedown="mouseDown(true,true)" ng-mouseup="mouseDown(false,true)" ng-style="leftThumbStyle">'
                        + '<div class="tool_tip left" ng-show="isLeftMouseDown">{{getTimeperiodText(timeperiodData,leftIndex)}}</div>'
                    + '</div>'
                    + '<div class="thumb thumb_right vertical_center" ng-show="config.IsMulti" ng-mousedown="mouseDown(true,false)" ng-mouseup="mouseDown(false,false)" ng-style="rightThumbStyle">'
                        + '<div class="tool_tip right" ng-show="isRightMouseDown">{{getTimeperiodText(timeperiodData,rightIndex)}}</div>'
                    + '</div>'
                    + '<div class="fill_rail" ng-style="fillStyle" ng-show="config.IsMulti"></div>'
                    + '<div ng-repeat="item in timeperiodData" class="tick vertical_center" ng-style="{left:($index*stepValue)+\'%\'}"></div>'
                + '</div>'

                + '<div ng-repeat="item in timeperiodData" class="legend" ng-style="{left:($index*stepValue)+\'%\'}" ng-class="{\'active\':config.IsMulti ? ($index >= leftIndex && $index <= rightIndex) : $index === leftIndex}">'
                    + '{{getTimeperiodText(timeperiodData,$index)}}'
                + '</div>'
            + '</div>'
            + '<span class="selected_range"><span>{{getTimeperiodText(timeperiodData,leftIndex)}} <span ng-show="config.IsMulti">{{\' - \' + getTimeperiodText(timeperiodData,rightIndex)}}</span></span>'
        + '</div>'
    };
});


app.controller('scrollController', function ($scope) {
    $scope.timeperiodData = $scope.$parent.timeperiodData;
    if ($scope.timeperiodData === null)
        return;
    $scope.length = $scope.timeperiodData.length;

    //Modify values to adjust
    //$scope.length = 5;
    let autoFit = true;
	//in case if not autofit specify number of ticks to be there for available width
    let stepWidthValue = 10;
    let maxNumberOfTicks = $scope.length;//That will be shown without scroll

    //Update this to make range slider
    //$scope.config = { IsMulti: true };

    $scope.numberOfTicks = $scope.length < maxNumberOfTicks ? $scope.length - 1 : maxNumberOfTicks - 1;
    //$scope.maxAllowedSelections = 9999;
    $scope.stepWidth = autoFit ? 100 / $scope.numberOfTicks : stepWidthValue;
    $scope.stepValue = 100.0 / $scope.numberOfTicks;
    $scope.leftIndex = 0;
    $scope.rightIndex = $scope.maxAllowedSelections;
    $scope.position = { left: 0, right: 100 };

    $scope.sliderStyle = {};
    $scope.leftThumbStyle = {};
    let initialRight = $scope.numberOfTicks > $scope.maxAllowedSelections ? ($scope.maxAllowedSelections) : $scope.numberOfTicks;
    $scope.rightThumbStyle = { left: (initialRight * $scope.stepValue) + "%" };
    $scope.fillStyle = { right: (100 - initialRight * $scope.stepValue) + "%" };
    if ($scope.stepWidth != undefined && $scope.stepWidth != 0) {
        let percent = $scope.stepWidth * $scope.numberOfTicks;
        percent = percent < 100 ? 100 : percent;
        $scope.sliderStyle.width = "calc("+ percent + "% - 16px)";
    }
	
	//Override in parent
	// $scope.$parent.timeperiodChanged = function (timeperiodData, leftIndex, rightIndex, parents, isTrend) {
		// console.log(timeperiodData[leftIndex] + (isTrend? " - " + timeperiodData[rightIndex] :""));
	// };
	
	//Override in parent
	// $scope.$parent.getTimeperiodText = function (timeperiodData,index){
		// console.log("not impelemented");
	// };	

    // $scope.$parent.item.resetTimeperiod = function (leftIndex,rightIndex) {
        // clearSelection(leftIndex, rightIndex);
    // };

    function clearSelection(leftIndex, rightIndex) {
        if (leftIndex === undefined) {
            $scope.leftIndex = 0;
            $scope.rightIndex = initialRight;
            $scope.position = { left: 0, right: (initialRight * $scope.stepValue) };
            $scope.leftThumbStyle = { left: 0 };
            $scope.rightThumbStyle = { left: (initialRight * $scope.stepValue) + "%" };
            $scope.fillStyle = { right: (100 - initialRight * $scope.stepValue) + "%" };
        }
        else if ($scope.leftIndex !== leftIndex || (rightIndex !== undefined && $scope.rightIndex !== rightIndex)) {
            $scope.leftIndex = leftIndex;
            $scope.rightIndex = rightIndex === undefined ? initialRight : rightIndex;
            $scope.position = { left: ($scope.leftIndex * $scope.stepValue), right: ($scope.rightIndex * $scope.stepValue) };
            $scope.leftThumbStyle = { left: ($scope.leftIndex * $scope.stepValue) + "%" };
            $scope.rightThumbStyle = { left: ($scope.rightIndex * $scope.stepValue) + "%" };
            $scope.fillStyle = { left: ($scope.leftIndex * $scope.stepValue) + "%", right: (100 - $scope.rightIndex * $scope.stepValue) + "%" };
            adjustWhenSamePosition();
        }
    }

    $scope.onChangeValue = function () {
        adjustWhenSamePosition();
        $scope.$parent.timeperiodChanged($scope.timeperiodData, $scope.leftIndex, ($scope.config.IsMulti ? $scope.rightIndex : $scope.leftIndex), $scope.$parent.parent_list, $scope.config.IsMulti);
        //console.log("left:" + $scope.leftIndex + "\nRight:" + $scope.rightIndex);
    };

    function adjustWhenSamePosition() {
        if ($scope.position.right - $scope.position.left <= 3 && $scope.config.IsMulti) {
            if ($scope.position.left >= 50) {
                $scope.leftThumbStyle.pointerEvents = "auto";
                $scope.rightThumbStyle.pointerEvents = "none";
            }
            else if ($scope.position.right < 50) {
                $scope.leftThumbStyle.pointerEvents = "none";
                $scope.rightThumbStyle.pointerEvents = "auto";
            }
            else {
                $scope.leftThumbStyle.pointerEvents = "auto";
                $scope.rightThumbStyle.pointerEvents = "auto";
            }
        }
        else {
            $scope.leftThumbStyle.pointerEvents = "auto";
            $scope.rightThumbStyle.pointerEvents = "auto";
        }
    }

    $scope.isLeftMouseDown = false;
    $scope.isRightMouseDown = false;
    $scope.mouseDown = function (value, isLeft) {
        if (value == false && ($scope.isLeftMouseDown || $scope.isRightMouseDown)) {
            $scope.onChangeValue();
            //$scope.getValue();
        }
        if (isLeft == true) {
            $scope.isLeftMouseDown = value;
            $scope.isRightMouseDown = false;
        }
        else if ($scope.config.IsMulti && isLeft == false) {
            $scope.isLeftMouseDown = false;
            $scope.isRightMouseDown = value;
        }
        else {
            $scope.isLeftMouseDown = false;
            $scope.isRightMouseDown = false;
        }
    }
    $scope.mouseMove = function (event) {
        let containerElement = $scope.elem.getElementsByClassName("srocll_container_inner")[0];
        let parentElement = $scope.elem.getElementsByClassName("srocll_container")[0];
        if ($scope.isLeftMouseDown) {
            let position = event.clientX + parentElement.scrollLeft - containerElement.getBoundingClientRect().left;
            let left = position / containerElement.offsetWidth * 100.0;
            left = left > 100 ? 100 : (left < 0 ? 0 : left);
            if (!$scope.config.IsMulti || left < $scope.position.right) {
                let leftIndex = Math.round(left / $scope.stepValue);
                if ($scope.rightIndex - leftIndex > $scope.maxAllowedSelections) {
                    alert("Cannot select more than " + ($scope.maxAllowedSelections + 1) + " selections", "Alert");
                    return;
                }
                $scope.leftThumbStyle = { left: left + "%" };
                $scope.fillStyle.left = left + "%";
                $scope.position.left = left;
                $scope.leftIndex = leftIndex < 0 ? 0 : leftIndex;
            }
        }
        else if ($scope.isRightMouseDown) {
            let position = event.clientX + parentElement.scrollLeft - containerElement.getBoundingClientRect().left;
            let left = position / containerElement.offsetWidth * 100.0;
            left = left > 100 ? 100 : (left < 0 ? 0 : left);
            if (left > $scope.position.left) {
                let rightIndex = Math.round(left / $scope.stepValue);
                if (rightIndex - $scope.leftIndex > $scope.maxAllowedSelections) {
                    alert("Cannot select more than " + ($scope.maxAllowedSelections + 1) + " selections", "Alert");
                    return;
                }
                $scope.rightThumbStyle = { left: left + "%" };
                $scope.fillStyle.right = (100 - left) + "%";
                $scope.position.right = left;
                $scope.rightIndex = rightIndex > $scope.numberOfTicks ? $scope.numberOfTicks : rightIndex;
            }
        }
    }

});
