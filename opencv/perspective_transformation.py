#!/usr/bin/env python3

import cv2
import numpy as np

# load image
image_original = cv2.imread("original.jpg")

# gray scaling
image_gray = cv2.cvtColor(image_original, cv2.COLOR_BGR2GRAY)
#cv2.imwrite('image_gray.jpg', image_gray)

# image thresholding
ret, image_thresholding = cv2.threshold(image_gray, 127, 255, cv2.THRESH_BINARY)
#cv2.imwrite('image_thresholding.jpg', image_thresholding)

# extract contours
contours, hierarchy = cv2.findContours(image_thresholding, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

# picking biggest area
areas = []
for cnt in contours:
    area = cv2.contourArea(cnt)
    if area > 10000:
        epsilon = 0.1*cv2.arcLength(cnt,True)
        approx = cv2.approxPolyDP(cnt,epsilon,True)
        areas.append(approx)

## drawing contours on the original image
#image_contoured = cv2.imread("original.jpg");
#cv2.drawContours(image_contoured, areas, -1,(0,255,0),3)
#cv2.imwrite('image_contoured.jpg', image_contoured)

# perspective transformation
dst = []
pts1 = np.float32(areas[0])
pts2 = np.float32([[1000,0],[0,0],[0,1600],[1000,1600]])

transform = cv2.getPerspectiveTransform(pts1,pts2)
dst = cv2.warpPerspective(image_original, transform, (1000,1600))

# save image 
cv2.imwrite('output.jpg', dst)
