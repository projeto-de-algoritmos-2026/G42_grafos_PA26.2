#include "router.hpp"

#include <iomanip>
#include <limits>
#include <sstream>

namespace {

std::string escapeJsonString(const std::string& value) {
    std::ostringstream stream;
    for (char character : value) {
        switch (character) {
            case '"':
                stream << "\\\"";
                break;
            case '\\':
                stream << "\\\\";
                break;
            case '\b':
                stream << "\\b";
                break;
            case '\f':
                stream << "\\f";
                break;
            case '\n':
                stream << "\\n";
                break;
            case '\r':
                stream << "\\r";
                break;
            case '\t':
                stream << "\\t";
                break;
            default:
                if (static_cast<unsigned char>(character) < 0x20) {
                    stream << "\\u" << std::hex << std::setw(4) << std::setfill('0')
                           << static_cast<int>(static_cast<unsigned char>(character))
                           << std::dec << std::setfill(' ');
                } else {
                    stream << character;
                }
                break;
        }
    }
    return stream.str();
}

std::string formatNumber(double value) {
    std::ostringstream stream;
    stream << std::setprecision(10) << value;
    return stream.str();
}

std::string buildErrorJson(const std::string& message) {
    return "{\"status\": \"error\", \"message\": \"" + escapeJsonString(message) + "\"}";
}

}

Router::Router(int maxLocations)
    : maxLocations(maxLocations), nextId(0), graph(maxLocations) {}

int Router::registerLocation(const std::string& name) {
    auto existing = nameToId.find(name);
    if (existing != nameToId.end()) {
        return existing->second;
    }

    if (nextId >= maxLocations) {
        throw std::out_of_range("Location capacity exceeded");
    }

    int assignedId = nextId++;
    nameToId.emplace(name, assignedId);
    idToName.emplace(assignedId, name);
    return assignedId;
}

bool Router::addLocation(const std::string& name) {
    if (nameToId.find(name) != nameToId.end()) {
        return false;
    }
    registerLocation(name);
    return true;
}

void Router::addRoute(const std::string& source, const std::string& target, double distance) {
    int sourceId = registerLocation(source);
    int targetId = registerLocation(target);
    graph.addUndirectedEdge(sourceId, targetId, distance);
}

std::string Router::getShortestPathJson(const std::string& source, const std::string& target) {
    auto sourceEntry = nameToId.find(source);
    if (sourceEntry == nameToId.end()) {
        return buildErrorJson("Source location not found: " + source);
    }

    auto targetEntry = nameToId.find(target);
    if (targetEntry == nameToId.end()) {
        return buildErrorJson("Target location not found: " + target);
    }

    PathResult result;
    try {
        result = graph.calculateShortestPath(sourceEntry->second, targetEntry->second);
    } catch (const std::exception& error) {
        return buildErrorJson(error.what());
    }

    if (result.path.empty() || result.totalCost == std::numeric_limits<double>::infinity()) {
        return buildErrorJson("No route available between " + source + " and " + target);
    }

    std::ostringstream stream;
    stream << "{\"status\": \"success\", \"path\": [";
    for (std::size_t index = 0; index < result.path.size(); ++index) {
        if (index > 0) {
            stream << ", ";
        }
        stream << "\"" << escapeJsonString(idToName.at(result.path[index])) << "\"";
    }
    stream << "], \"distance\": " << formatNumber(result.totalCost) << "}";
    return stream.str();
}
