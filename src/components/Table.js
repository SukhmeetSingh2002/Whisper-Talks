import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  TabsBody,
  TabPanel,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

const TABLE_HEAD = ["Member", "Visibility", "Seen", "Replied", "Date", ""];

export default function Table({
  handleNewWhisper,
  rowData,
  handleRowClick,
  secondPanelRowData,
  handleRefresh,
}) {
  const [TABS, setTABS] = useState([
    {
      label: "Sent",
      value: "sent",
      data: [],
    },
    {
      label: "Received",
      value: "received",
      data: [
        // {
        //   img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg",
        //   name: "John Michael",
        //   email: "john@creative-tim.com",
        //   job: "Manager",
        //   org: "Organization",
        //   online: true,
        //   date: "23/04/18",
        // },
      ],
    },
    // {
    //   label: "Unmonitored",
    //   value: "unmonitored",
    // },
  ]);

  const [TABLE_ROWS, setTABLE_ROWS] = useState([
    // {
    //   img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg",
    //   name: "John Michael",
    //   email: "john@creative-tim.com",
    //   job: "Manager",
    //   org: "Organization",
    //   online: true,
    //   date: "23/04/18",
    // },

  ]);

  useEffect(() => {
    // map over the rowData and create a new array of objects
    // with the data we need for the table
    const newTableRows = rowData.map((row) => {
      return {
        img:
          row.recipientProfilePic ??
          "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg",
        name: row.recipientName ?? "",
        email: row.recipientEmail ?? "",
        visibilty: row.senderDetailsType ?? "",
        online: row.isRead ?? false,
        isSeen: row.isRead ?? false,
        isReplied: row.isReplied ?? false,
        // convert timestamp to date
        date: new Date(row.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "short",
        }),

        time: new Date(row.timestamp).toLocaleTimeString() ?? "",
        whisperId: row.whisperId ?? "N/A",
      };
    });

    // sort the new array by date
    newTableRows.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    if (newTableRows.length > 0) {
      setTABLE_ROWS(newTableRows);
      // set data of sent Tab
      setTABS((prev) => {
        return prev.map((tab) => {
          if (tab.value === "sent") {
            return {
              ...tab,
              data: newTableRows,
            };
          }
          return tab;
        });
      });
    }
  }, [rowData]);

  useEffect(() => {
    // map over the secondPanelRowData and create a new array of objects
    // with the data we need for the table
    const newTableRows = secondPanelRowData.map((row) => {
      return {
        img:
          row.senderProfilePic ??
          "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg",
        name: row.senderName ?? "Name not visible",
        email: row.senderEmail ?? "Email not visible",
        visibilty: row.senderDetailsType ?? "",
        // online: row.online ?? false,
        isSeen: row.isRead ?? false,
        isReplied: row.isReplied ?? false,
        // convert timestamp to date
        date: new Date(row.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",

          day: "numeric",
          weekday: "short",
        }),

        time: new Date(row.timestamp).toLocaleTimeString() ?? "",
        whisperId: row.whisperId ?? "N/A",
      };
    });

    // sort the new array by date
    newTableRows.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    if (newTableRows.length > 0) {
      // set data of sent Tab
      setTABS((prev) => {
        return prev.map((tab) => {
          if (tab.value === "received") {
            return {
              ...tab,
              data: newTableRows,
            };
          }
          return tab;
        });
      });
    }
  }, [secondPanelRowData]);

  return (
    <Card className="h-full w-full">
      <Tabs value="sent" className="">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-1 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Whispers
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See all your whispers here
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                variant="outlined"
                color="blue-gray"
                size="sm"
                className="flex items-center gap-3"
                onClick={handleRefresh}
              >
                Refresh <ArrowPathIcon className="h-4 w-4" />
              </Button>
              <Button
                className="flex items-center gap-3"
                color="pink"
                size="sm"
                onClick={handleNewWhisper}
              >
                <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> New Whisper
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row mt-4">
            <TabsHeader>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>
                  &nbsp;&nbsp;{label}&nbsp;&nbsp;
                </Tab>
              ))}
            </TabsHeader>

            {/* <div className="w-full md:w-72">
            <Input
              label="Search"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div> */}
          </div>
        </CardHeader>
        <CardBody className="overflow-visible px-0">
          <TabsBody
            animate={{
              initial: { y: 250, opacity: 0 },
              mount: { y: 0, opacity: 1 },
              unmount: { y: 250, opacity: 0 },
            }}
          >
            {TABS.map(
              ({ value, data }) => (
                // alert(value),
                console.log("datataa", data),
                console.log("datataa2", TABLE_HEAD),
                (
                  <TabPanel key={value} value={value}>
                    <table
                      className="mt-4 w-full min-w-max table-auto text-left"
                      key={"value"}
                    >
                      <thead>
                        <tr>
                          {/* {data.map((head) => ( */}
                          {TABLE_HEAD.map((head) => (
                            <th
                              key={head}
                              className="border-y border-blue-gray-100 bg-blue-gray-250/50 p-4"
                            >
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                {head}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map(
                          (
                            {
                              img,
                              name,
                              email,
                              visibilty,
                              online,
                              isSeen,
                              isReplied,
                              date,
                              time,
                              whisperId,
                            },
                            index
                          ) => {
                            const isLast = index === TABLE_ROWS.length - 1;
                            const classes = isLast
                              ? "p-4"
                              : "p-4 border-b border-blue-gray-50";

                            return (
                              <tr key={whisperId}>
                                <td className={classes}>
                                  <div className="flex items-center gap-3">
                                    <Avatar src={img} alt={name} size="sm" />
                                    <div className="flex flex-col">
                                      <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                      >
                                        {name}
                                      </Typography>
                                      <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal opacity-70"
                                      >
                                        {email}
                                      </Typography>
                                    </div>
                                  </div>
                                </td>
                                <td className={classes}>
                                  <div className="flex flex-col">
                                    {/* color based on visibilty */}
                                    <div className="w-max">
                                      <Chip
                                        variant="ghost"
                                        size="sm"
                                        value={visibilty ?? "Anonymous"}
                                        color={
                                          visibilty === "nameEmail"
                                            ? "green"
                                            : visibilty === "nameOnly"
                                            ? "blue"
                                            : visibilty === "emailOnly"
                                            ? "pink"
                                            : visibilty === "anonymous"
                                            ? "red"
                                            : "blue-gray"
                                        }
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className={classes}>
                                  <div className="w-max">
                                    <Chip
                                      variant="ghost"
                                      size="sm"
                                      value={isSeen ? "Seen" : "Not Seen"}
                                      color={isSeen ? "green" : "blue-gray"}
                                    />
                                  </div>
                                </td>
                                <td className={classes}>
                                  <div className="w-max">
                                    <Chip
                                      variant="ghost"
                                      size="sm"
                                      value={
                                        isReplied ? "Replied" : "Not Replied"
                                      }
                                      color={isReplied ? "green" : "blue-gray"}
                                    />
                                  </div>
                                </td>
                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    {date}
                                  </Typography>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal opacity-70"
                                  >
                                    {time}
                                  </Typography>
                                </td>
                                <td className={classes}>
                                  <Tooltip content="View">
                                    <IconButton
                                      variant="text"
                                      color="blue-gray"
                                      onClick={() =>
                                        handleRowClick(whisperId, value)
                                      }
                                    >
                                      <Badge
                                        color="pink"
                                        invisible={
                                          !(value === "received" && !isSeen)
                                        }
                                        overlap="square"
                                        placement="top-end"
                                      >
                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                      </Badge>
                                    </IconButton>
                                  </Tooltip>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </TabPanel>
                )
              )
            )}
          </TabsBody>
        </CardBody>
        {/* <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Page 1 of 10
        </Typography>
        <div className="flex gap-2">
          <Button variant="outlined" color="blue-gray" size="sm">
            Previous
          </Button>
          <Button variant="outlined" color="blue-gray" size="sm">
            Next
          </Button>
        </div>
      </CardFooter> */}
      </Tabs>
    </Card>
  );
}
