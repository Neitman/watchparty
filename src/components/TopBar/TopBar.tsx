import React, { useCallback, useContext } from "react";
import { serverPath, getUserImage, softWhite } from "../../utils/utils";
import { ActionIcon, Avatar, Button, Menu, Text } from "@mantine/core";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { LoginModal } from "../Modal/LoginModal";
import { SubscribeButton } from "../SubscribeButton/SubscribeButton";
import { ProfileModal } from "../Modal/ProfileModal";
import Announce from "../Announce/Announce";
import { InviteButton } from "../InviteButton/InviteButton";
import appStyles from "../App/App.module.css";
import { MetadataContext } from "../../MetadataContext";
import config from "../../config";
import {
  IconBrandDiscord,
  IconBrandFacebookFilled,
  IconBrandGoogleFilled,
  IconCirclePlusFilled,
  IconDatabase,
  IconLogin,
  IconMailFilled,
  IconTrash,
} from "@tabler/icons-react";
import styles from "./TopBar.module.css";

export async function createRoom(
  user: firebase.User | undefined,
  openNewTab: boolean | undefined,
  video: string = "",
) {
  try {
    let token: string | undefined = undefined;
    if (user) {
      try {
        token = await user.getIdToken();
      } catch (e) {
        console.warn("Could not retrieve user ID token:", e);
      }
    }
    const uid = user?.uid;
    const response = await fetch(serverPath + "/createRoom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        token,
        video,
      }),
    });
    if (!response.ok) {
      throw new Error(`Server returned status code ${response.status}`);
    }
    const data = await response.json();
    const { name } = data;
    if (!name) {
      throw new Error("Invalid response from server: room name missing");
    }
    const roomPath = name.startsWith("/") ? name : "/" + name;
    if (openNewTab) {
      window.open("/watch" + roomPath);
    } else {
      window.location.assign("/watch" + roomPath);
    }
  } catch (e: any) {
    console.error("Failed to create room:", e);
    alert("Could not create room. Please try again. (" + (e.message || e) + ")");
  }
}

export const NewRoomButton = (props: {
  size?: string;
  openNewTab?: boolean;
}) => {
  const context = useContext(MetadataContext);
  const onClick = useCallback(async () => {
    await createRoom(context.user, props.openNewTab);
  }, [context.user, props.openNewTab]);
  return (
    <Button
      size={props.size}
      onClick={onClick}
      className={styles.newRoomBtn}
      leftSection={<IconCirclePlusFilled />}
    >
      New Room
    </Button>
  );
};

type SignInButtonProps = {};

export class SignInButton extends React.Component<SignInButtonProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = {
    isLoginOpen: false,
    isProfileOpen: false,
    userImage: null as string | null,
    loadedUid: null as string | null,
  };

  async componentDidMount() {
    if (this.context.user) {
      const userImage = await getUserImage(this.context.user);
      this.setState({ userImage, loadedUid: this.context.user.uid });
    }
  }

  async componentDidUpdate() {
    const currentUid = this.context.user?.uid ?? null;
    if (currentUid !== this.state.loadedUid) {
      if (this.context.user) {
        const userImage = await getUserImage(this.context.user);
        this.setState({ userImage, loadedUid: currentUid });
      } else {
        this.setState({ userImage: null, loadedUid: null });
      }
    }
  }

  render() {
    if (this.context.user) {
      return (
        <div
          style={{
            margin: "4px",
            minWidth: "40px",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Avatar
            src={this.state.userImage}
            onClick={() => this.setState({ isProfileOpen: true })}
          />
          {this.state.isProfileOpen && this.context.user && (
            <ProfileModal
              userImage={this.state.userImage}
              close={() => this.setState({ isProfileOpen: false })}
            />
          )}
        </div>
      );
    }
    return (
      <React.Fragment>
        {this.state.isLoginOpen && (
          <LoginModal
            closeModal={() => this.setState({ isLoginOpen: false })}
          />
        )}
        <Button
          leftSection={<IconLogin />}
          onClick={() => this.setState({ isLoginOpen: true })}
        >
          Sign in
        </Button>
      </React.Fragment>
    );
  }
}

export class ListRoomsButton extends React.Component<{}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = { rooms: [] as PersistentRoom[] };

  componentDidMount() {
    this.refreshRooms();
  }

  refreshRooms = async () => {
    if (this.context.user) {
      try {
        const token = await this.context.user.getIdToken();
        const response = await fetch(
          serverPath + `/listRooms?uid=${this.context.user?.uid}&token=${token}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            this.setState({ rooms: data });
          } else {
            this.setState({ rooms: [] });
          }
        } else {
          this.setState({ rooms: [] });
        }
      } catch (e) {
        console.warn("Failed to fetch rooms:", e);
        this.setState({ rooms: [] });
      }
    }
  };

  deleteRoom = async (roomId: string) => {
    if (this.context.user) {
      try {
        const token = await this.context.user.getIdToken();
        await fetch(
          serverPath +
            `/deleteRoom?uid=${this.context.user?.uid}&token=${token}&roomId=${roomId}`,
          { method: "DELETE" },
        );
        const rooms = Array.isArray(this.state.rooms)
          ? this.state.rooms.filter((room) => room.roomId !== roomId)
          : [];
        this.setState({ rooms });
        this.refreshRooms();
      } catch (e) {
        console.warn("Failed to delete room:", e);
      }
    }
  };

  render() {
    const rooms = Array.isArray(this.state.rooms) ? this.state.rooms : [];
    return (
      <Menu>
        <Menu.Target>
          <Button
            color="grey"
            onClick={this.refreshRooms}
            leftSection={<IconDatabase />}
          >
            My rooms
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {rooms.length === 0 && (
            <Menu.Item disabled>You have no permanent rooms.</Menu.Item>
          )}
          {rooms.map((room: any) => {
            return (
              <Menu.Item
                key={room.roomId}
                component="a"
                href={
                  room.vanity ? "/r/" + room.vanity : "/watch" + room.roomId
                }
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>
                    <Text>
                      {room.vanity
                        ? `/r/${room.vanity}`
                        : `/watch${room.roomId}`}
                    </Text>
                    <Text size="xs" c="grey">
                      {room.roomId}
                    </Text>
                  </div>
                  <div style={{ marginLeft: "auto", paddingLeft: "20px" }}>
                    <ActionIcon
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        e.preventDefault();
                        this.deleteRoom(room.roomId);
                      }}
                      color="red"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </div>
                </div>
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    );
  }
}

export const TopBar = (props: {
  hideNewRoom?: boolean;
  hideSignin?: boolean;
  hideMyRooms?: boolean;
  roomTitle?: string;
  roomDescription?: string;
  roomTitleColor?: string;
}) => {
  const context = useContext(MetadataContext);
  const subscribeButton = <SubscribeButton />;
  return (
    <React.Fragment>
      <div className={styles.topBarContainer}>
        <a href="/" className={styles.logoWrapper}>
          <img className={styles.logoImg} src="/logo192.png" alt="WatchParty" />
          <span className={styles.brandTitle}>WatchParty</span>
        </a>
        {props.roomTitle || props.roomDescription ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginRight: 10,
              marginLeft: 10,
            }}
          >
            <div
              style={{
                fontSize: "24px",
                lineHeight: "28px",
                color: props.roomTitleColor || softWhite,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {props.roomTitle?.toUpperCase()}
            </div>
            <Text size="sm" style={{}}>
              {props.roomDescription}
            </Text>
          </div>
        ) : null}
        <Announce />
        <div
          className={appStyles.mobileStack}
          style={{
            display: "flex",
            marginLeft: "auto",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <ActionIcon
              component="a"
              color="gray"
              size="lg"
              href="https://discord.gg/3rYj5HV"
              target="_blank"
              rel="noopener noreferrer"
              title="Discord"
            >
              <IconBrandDiscord />
            </ActionIcon>
          </div>
          {!props.hideNewRoom && <NewRoomButton openNewTab />}
          {!props.hideMyRooms && context.user && <ListRoomsButton />}
          {subscribeButton}
          {!props.hideSignin && <SignInButton />}
        </div>
      </div>
    </React.Fragment>
  );
};
