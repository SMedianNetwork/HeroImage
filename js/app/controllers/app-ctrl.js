angularApp
	.controller('AppCtrl', function AppCtrl($scope, $timeout, IOSocket) {
        $scope.$on('socket:numClients', function(event, data) {
            //console.log("Got " + event.name + " Message: " + JSON.stringify(data.payload))
            var payload = data.payload;
            if (payload) {
                $scope.numActiveClients = payload + " Active Creator" + (payload > 1? 's' : '');
            }
        });

        const imageUrlBase64UrlMap = {}
        $scope.$on('socket:imageUrlBase64Url', function(event, data) {
            //console.log("Got " + event.name + " Message: " + JSON.stringify(data.payload))
            var payload = data.payload;
            if (payload) {
                imageUrlBase64UrlMap[payload.imageUrl] = payload.base64Url
                $timeout(() => {
                    $scope.imageUrlBase64UrlMap = imageUrlBase64UrlMap
                })
            }
        });
        
        function updateExistingImageUploads() {
            $scope.existingImageUploads = LocalStorageUtil.getAllImageUploads() || []
            if($scope.existingImageUploads.length) {
                $('.js-existingImageUploadsButtonContainer').show()
            } else {
                $('.js-existingImageUploadsButtonContainer').hide()
            }
        }
        updateExistingImageUploads()

        $scope.uploadAndOverlay = function () {
            var preview = document.getElementById('image-upload'); //selects the query named img
            var file    = document.querySelector('input[type=file]').files[0]; //sames as here
            var reader  = new FileReader();

            reader.onloadend = function () {
                preview.src = reader.result;
            }

            if (file) {
                reader.readAsDataURL(file); //reads the data as a URL
            } else {
                preview.src = "";
            }
        }

        var alreadyOpenedImageSearchFormOnce = false
        $scope.openImageSearchFormForType = function(type) {
            $scope.currentImageSearchType = type
            $scope.imageSearchFormIsOpen = true;
            if(!alreadyOpenedImageSearchFormOnce) {
                UnsplashSearchHandler.attachSearchJQueries($scope, $timeout)
            }
            alreadyOpenedImageSearchFormOnce = true
        }

        $scope.closeImageSearchForm = function() {
            $scope.imageSearchFormIsOpen = false;
        }

        $scope.openImageUploadsWindowForType = function(type) {
            $scope.currentImageSearchType = type
            $scope.imageUploadsWindowIsOpen = true
        }

        $scope.closeImageUploadsWindow = function() {
            $scope.imageUploadsWindowIsOpen = false
        }

        $scope.handleSelectSearchResultImageForType = function(image) {
            const base64Url = imageUrlBase64UrlMap[image.url]
            handleSelectImageForType($scope.currentImageSearchType, {
                url: image.url,
                base64Url: imageUrlBase64UrlMap[image.url]
            })
            $scope.closeImageSearchForm()
        }

        $scope.handleSelectExistingImageUploadForType = function(image) {
            handleSelectImageForType($scope.currentImageSearchType, {
                base64Url: image.base64Url
            })
            $scope.closeImageUploadsWindow()
        }

        document.addEventListener("LocalStorageUtil.savedImageUploads", function(e) {
            updateExistingImageUploads()
        });

        $scope.imageSearchResultsTypeMap = {base: [], overlay: []}

        $scope.updateMergedImageOverlayOpacity = function() {
            updateMergeImageOverlayOpacity($scope.mergeImageOpacity)
        }

        $(document).ready(function() {
            UnsplashSearchHandler.attachScope($scope, $timeout)
        })
    })