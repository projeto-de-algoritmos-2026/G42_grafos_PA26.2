cmake_minimum_required(VERSION 3.10)
project(UrbanRoutingDelivery)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_library(urban_router_lib 
    src/graph.cpp
)