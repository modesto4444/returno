// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Returno {
    struct Report {
        string id;
        string itemType;
        string title;
        string category;
        string location;
        string date;
        string description;
        uint256 timestamp;
        address reporter;
        bool hasMatch;
        string matchesWith;
    }

    Report[] public reports;
    uint256 public reportCount;

    event ReportCreated(string id, string itemType, string title, address reporter, uint256 timestamp);
    event MatchFound(string reportId, string matchedWith);

    function submitReport(
        string memory _type,
        string memory _title,
        string memory _category,
        string memory _location,
        string memory _date,
        string memory _description
    ) public returns (uint256) {
        reportCount++;
        string memory id = string(abi.encodePacked("BF-", uint2str(reportCount + 845)));

        reports.push(Report({
            id: id,
            itemType: _type,
            title: _title,
            category: _category,
            location: _location,
            date: _date,
            description: _description,
            timestamp: block.timestamp,
            reporter: msg.sender,
            hasMatch: false,
            matchesWith: ""
        }));

        emit ReportCreated(id, _type, _title, msg.sender, block.timestamp);
        return reportCount - 1;
    }

    function getAllReports() public view returns (Report[] memory) {
        return reports;
    }

    function getReport(uint256 index) public view returns (Report memory) {
        return reports[index];
    }

    function setMatch(uint256 indexA, uint256 indexB) public {
        reports[indexA].hasMatch = true;
        reports[indexA].matchesWith = reports[indexB].id;
        reports[indexB].hasMatch = true;
        reports[indexB].matchesWith = reports[indexA].id;
        emit MatchFound(reports[indexA].id, reports[indexB].id);
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k--;
            bstr[k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}