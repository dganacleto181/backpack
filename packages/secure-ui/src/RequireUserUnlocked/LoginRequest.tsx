import { useState } from "react";
import { ImageBackground, Platform } from "react-native";

// import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import {
  _secureOnboardedUserAtom,
  isLockAvatarFullScreen,
  useAvatarUrl,
  userClientAtom,
} from "@coral-xyz/recoil";
import {
  AlignJustifyIcon,
  BanIcon,
  Button,
  CustomScrollView,
  Form,
  RedBackpackIcon,
  Stack,
  StyledText,
  useTheme,
  Svg,
  Path,
  BpPasswordInput,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { ForgotPasswordDrawer } from "./ForgotPasswordDrawer";
import { LockedMenuDrawer } from "./LockedMenuDrawer";
import { ErrorMessage } from "../_sharedComponents/ErrorMessage";

export function LoginRequest({
  didUnlock,
  onReset,
}: {
  didUnlock?: () => void;
  onReset?: () => void;
}) {
  const currentUser = useRecoilValue(_secureOnboardedUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const [hasError, setHasError] = useState(false);
  const [migrationFailed, setMigrationFailed] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const theme = useTheme();
  const avatarUrl = useAvatarUrl(120, currentUser.user.username);
  const isFullScreenLockAvatar = useRecoilValue(isLockAvatarFullScreen);

  const onChange = (password: string) => {
    setPassword(password);
  };

  const onSubmit = async () => {
    userClient
      .unlockKeyring({
        uuid: currentUser.user.uuid,
        password,
      })
      .then((unlockResponse) => {
        if (unlockResponse.error?.message.includes("migration failed")) {
          setMigrationFailed(true);
          return;
        }

        if (unlockResponse.response?.unlocked === true) {
          didUnlock?.();
          return;
        }

        setHasError(true);
      })
      .catch((e) => {
        setHasError(true);
      });
  };

  if (migrationFailed) {
    return <MigrationFailed />;
  }

  // // TODO(extension) when dark-mode is re-enabled, fix this
  // // When locking wallet, Theme turns to "dark" on the input
  // const backgroundColor = Platform.select({
  //   web: "#FFF",
  //   native: "$baseBackgroundL1",
  // });

  return (
    <ImageBackground
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
      source={{ uri: isFullScreenLockAvatar ? avatarUrl : undefined }}
      resizeMode="cover"
    >
      <Stack
        position="relative"
        height="100%"
        width="100%"
        backgroundColor="$baseBackgroundL0"
      >
        <Stack
          position="absolute"
          top="$4"
          right="$4"
          cursor="pointer"
          zIndex={1000}
          onPress={() => setOpenMenu(!openMenu)}
        >
          <AlignJustifyIcon width={20} height={20} color={theme.baseIcon.val} />
        </Stack>
        <CustomScrollView
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
          }}
        >
          <Stack
            position="relative"
            height="100%"
            width="100%"
            // TODO display:flex
            // eslint-disable-next-line
            display="flex"
            flex={1}
            alignSelf="center"
            justifyContent="center"
            space="$4"
          >
            <Stack paddingTop="$9" alignItems="center">
              <RedBackpackIcon style={{ marginBottom: 32 }} />
              <BackpackText fill={theme.baseTextHighEmphasis.val} />
            </Stack>
            <Stack marginHorizontal="$3" marginTop="$4" zIndex={1}>
              <Stack
                alignItems="center"
                height={120}
                marginBottom="$-4"
                // marginTop="$4"
                zIndex={0}
              >
                <Stack justifyContent="center" height={120} width={120}>
                  {/* Empty for spacing. */}
                </Stack>
              </Stack>

              <Form onSubmit={onSubmit}>
                <BpPasswordInput
                  onChangeText={onChange}
                  onSubmitEditing={onSubmit}
                  hasError={hasError}
                  autoFocus
                />
                <Button
                  mt="$3"
                  backgroundColor="$buttonPrimaryBackground"
                  borderColor="$baseBorderLight"
                  paddingVertical="$5"
                  paddingHorizontal="$4"
                  borderRadius={12}
                  borderWidth={0}
                  textProps={{
                    color: "$buttonPrimaryText",
                    fontWeight: "$bold",
                  }}
                  focusStyle={{
                    borderWidth: 0,
                    backgroundColor: "$buttonPrimaryBackground",
                  }}
                  pressStyle={{
                    borderWidth: 0,
                    opacity: 0.8,
                  }}
                  hoverStyle={{
                    borderWidth: 0,
                    backgroundColor: "$buttonPrimaryBackground",
                    opacity: 0.9,
                  }}
                  onPress={onSubmit}
                >
                  Unlock
                </Button>
              </Form>
            </Stack>
            <Stack height={32} alignItems="center">
              {hasError ? (
                <StyledText
                  onPress={() => setForgotPassword(true)}
                  color={
                    isFullScreenLockAvatar
                      ? "$invertedBaseTextHighEmphasis"
                      : "$baseTextMedEmphasis"
                  }
                  fontSize={16}
                  fontWeight="$medium"
                  cursor="pointer"
                  padding="$2"
                >
                  Forgot Password?
                </StyledText>
              ) : null}
            </Stack>
          </Stack>
        </CustomScrollView>
        <ForgotPasswordDrawer
          open={forgotPassword}
          onOpenChange={setForgotPassword}
        />
        <LockedMenuDrawer open={openMenu} onOpenChange={setOpenMenu} />
      </Stack>
    </ImageBackground>
  );
}

function MigrationFailed() {
  return (
    <Stack height="100%" width="100%" backgroundColor="$baseBackgroundL1">
      <ErrorMessage
        icon={(iconProps) => <BanIcon {...iconProps} />}
        title="Unable to migrate"
        body={
          "Thank you for participating in the Backpack Beta! We weren't able to migrate your account. Please reinstall Backpack to continue. Don't worry, this is normal."
        }
      />
    </Stack>
  );
}

function BackpackText({ fill }: { fill: string }) {
  return (
    <Svg width="200" height="41" viewBox="0 0 200 41" fill="none">
      <Path
        d="M2.02026 31.597V1.49499H14.748C16.8221 1.49499 18.6 1.84518 20.0815 2.54554C21.563 3.2459 22.6944 4.25603 23.4755 5.57594C24.2567 6.86892 24.6473 8.44473 24.6473 10.3034C24.6473 11.6233 24.2837 12.8893 23.5564 14.1015C22.8291 15.2867 21.6304 16.2834 19.9603 17.0915V14.0207C21.5496 14.6402 22.7752 15.381 23.6372 16.243C24.4991 17.105 25.0918 18.0478 25.415 19.0714C25.7382 20.068 25.8999 21.1186 25.8999 22.223C25.8999 25.186 24.9167 27.4892 22.9503 29.1323C20.9839 30.7755 18.2498 31.597 14.748 31.597H2.02026ZM8.2831 26.1423H15.4753C16.7413 26.1423 17.7514 25.7787 18.5057 25.0514C19.2599 24.3241 19.637 23.3813 19.637 22.223C19.637 21.0378 19.2599 20.0815 18.5057 19.3542C17.7514 18.6269 16.7413 18.2632 15.4753 18.2632H8.2831V26.1423ZM8.2831 12.8085H15.1924C16.1622 12.8085 16.9299 12.5391 17.4955 12.0004C18.0882 11.4347 18.3845 10.694 18.3845 9.77811C18.3845 8.86225 18.0882 8.13495 17.4955 7.59621C16.9299 7.03054 16.1622 6.7477 15.1924 6.7477H8.2831V12.8085Z"
        fill={fill}
      />
      <Path
        d="M36.3014 32.0819C34.7121 32.0819 33.3384 31.826 32.1801 31.3142C31.0218 30.8024 30.1329 30.0751 29.5133 29.1323C28.8938 28.1626 28.584 27.0178 28.584 25.6978C28.584 24.4587 28.8668 23.3678 29.4325 22.425C29.9982 21.4553 30.8602 20.6472 32.0184 20.0007C33.2037 19.3542 34.6717 18.8963 36.4226 18.6269L43.1703 17.5359V21.9805L37.5136 22.9907C36.6516 23.1523 35.9916 23.4351 35.5337 23.8392C35.0758 24.2163 34.8468 24.7685 34.8468 25.4958C34.8468 26.1692 35.1027 26.6945 35.6145 27.0716C36.1263 27.4487 36.7594 27.6373 37.5136 27.6373C38.5103 27.6373 39.3857 27.4218 40.1399 26.9908C40.8942 26.5598 41.4733 25.9807 41.8774 25.2534C42.3084 24.4992 42.5239 23.6776 42.5239 22.7887V17.0511C42.5239 16.216 42.1871 15.5157 41.5137 14.95C40.8672 14.3843 39.9783 14.1015 38.847 14.1015C37.7695 14.1015 36.8132 14.3978 35.9782 14.9904C35.1701 15.583 34.5775 16.3642 34.2003 17.3339L29.3517 15.0308C29.7827 13.7917 30.4696 12.7277 31.4124 11.8388C32.3552 10.9499 33.4865 10.263 34.8064 9.77811C36.1263 9.29324 37.5675 9.05081 39.1298 9.05081C40.9885 9.05081 42.6316 9.38752 44.0593 10.0609C45.4869 10.7344 46.5913 11.6772 47.3725 12.8893C48.1806 14.0746 48.5847 15.4618 48.5847 17.0511V31.597H42.9279V28.0414L44.3017 27.7989C43.6552 28.7687 42.9414 29.5768 42.1602 30.2233C41.379 30.8428 40.5036 31.3007 39.5339 31.597C38.5641 31.9203 37.4866 32.0819 36.3014 32.0819Z"
        fill={fill}
      />
      <Path
        d="M63.8582 32.0819C61.6494 32.0819 59.6561 31.5836 57.8782 30.5869C56.1273 29.5633 54.7266 28.176 53.6761 26.4251C52.6525 24.6742 52.1407 22.7078 52.1407 20.5259C52.1407 18.3441 52.6525 16.3911 53.6761 14.6672C54.6997 12.9163 56.1004 11.5425 57.8782 10.5458C59.6561 9.54914 61.6494 9.05081 63.8582 9.05081C65.5014 9.05081 67.0233 9.33365 68.4241 9.89933C69.8248 10.465 71.0235 11.2596 72.0201 12.2832C73.0168 13.2799 73.7306 14.4651 74.1616 15.8389L68.9089 18.1016C68.5318 16.9972 67.8853 16.1218 66.9695 15.4753C66.0805 14.8288 65.0435 14.5055 63.8582 14.5055C62.8077 14.5055 61.8649 14.7614 61.0299 15.2732C60.2218 15.785 59.5753 16.4989 59.0904 17.4147C58.6325 18.3306 58.4035 19.3811 58.4035 20.5664C58.4035 21.7516 58.6325 22.8021 59.0904 23.718C59.5753 24.6338 60.2218 25.3477 61.0299 25.8595C61.8649 26.3713 62.8077 26.6272 63.8582 26.6272C65.0704 26.6272 66.1209 26.3039 67.0099 25.6574C67.8988 25.011 68.5318 24.1355 68.9089 23.0311L74.1616 25.3342C73.7576 26.6272 73.0572 27.7855 72.0605 28.8091C71.0639 29.8327 69.8652 30.6408 68.4645 31.2334C67.0637 31.7991 65.5283 32.0819 63.8582 32.0819Z"
        fill={fill}
      />
      <Path
        d="M77.7306 31.597V1.01013H83.7914V20.6068L81.5287 19.8795L91.2664 9.53568H98.7414L90.7411 18.4249L98.701 31.597H91.832L85.1651 20.4047L88.6804 19.5158L81.9327 26.8696L83.7914 23.3543V31.597H77.7306Z"
        fill={fill}
      />
      <Path
        d="M101.406 39.6781V9.53568H107.062V13.7378L106.537 12.5257C107.264 11.4213 108.248 10.5727 109.487 9.98013C110.753 9.36058 112.194 9.05081 113.81 9.05081C115.911 9.05081 117.81 9.56261 119.507 10.5862C121.204 11.6098 122.551 12.9971 123.548 14.748C124.544 16.4719 125.043 18.4114 125.043 20.5664C125.043 22.6944 124.544 24.6338 123.548 26.3847C122.578 28.1356 121.245 29.5229 119.548 30.5465C117.851 31.5701 115.925 32.0819 113.77 32.0819C112.261 32.0819 110.86 31.8125 109.567 31.2738C108.301 30.7081 107.278 29.8865 106.497 28.8091L107.466 27.5565V39.6781H101.406ZM113.042 26.6272C114.174 26.6272 115.17 26.3713 116.032 25.8595C116.894 25.3477 117.568 24.6338 118.053 23.718C118.538 22.8021 118.78 21.7516 118.78 20.5664C118.78 19.3811 118.538 18.3441 118.053 17.4551C117.568 16.5393 116.894 15.8255 116.032 15.3137C115.17 14.7749 114.174 14.5055 113.042 14.5055C111.965 14.5055 110.995 14.7614 110.133 15.2732C109.298 15.785 108.638 16.4989 108.153 17.4147C107.695 18.3306 107.466 19.3811 107.466 20.5664C107.466 21.7516 107.695 22.8021 108.153 23.718C108.638 24.6338 109.298 25.3477 110.133 25.8595C110.995 26.3713 111.965 26.6272 113.042 26.6272Z"
        fill={fill}
      />
      <Path
        d="M135.421 32.0819C133.832 32.0819 132.458 31.826 131.3 31.3142C130.141 30.8024 129.252 30.0751 128.633 29.1323C128.013 28.1626 127.704 27.0178 127.704 25.6978C127.704 24.4587 127.986 23.3678 128.552 22.425C129.118 21.4553 129.98 20.6472 131.138 20.0007C132.323 19.3542 133.791 18.8963 135.542 18.6269L142.29 17.5359V21.9805L136.633 22.9907C135.771 23.1523 135.111 23.4351 134.653 23.8392C134.195 24.2163 133.966 24.7685 133.966 25.4958C133.966 26.1692 134.222 26.6945 134.734 27.0716C135.246 27.4487 135.879 27.6373 136.633 27.6373C137.63 27.6373 138.505 27.4218 139.259 26.9908C140.014 26.5598 140.593 25.9807 140.997 25.2534C141.428 24.4992 141.643 23.6776 141.643 22.7887V17.0511C141.643 16.216 141.307 15.5157 140.633 14.95C139.987 14.3843 139.098 14.1015 137.967 14.1015C136.889 14.1015 135.933 14.3978 135.098 14.9904C134.29 15.583 133.697 16.3642 133.32 17.3339L128.471 15.0308C128.902 13.7917 129.589 12.7277 130.532 11.8388C131.475 10.9499 132.606 10.263 133.926 9.77811C135.246 9.29324 136.687 9.05081 138.249 9.05081C140.108 9.05081 141.751 9.38752 143.179 10.0609C144.606 10.7344 145.711 11.6772 146.492 12.8893C147.3 14.0746 147.704 15.4618 147.704 17.0511V31.597H142.047V28.0414L143.421 27.7989C142.775 28.7687 142.061 29.5768 141.28 30.2233C140.499 30.8428 139.623 31.3007 138.653 31.597C137.684 31.9203 136.606 32.0819 135.421 32.0819Z"
        fill={fill}
      />
      <Path
        d="M162.978 32.0819C160.769 32.0819 158.776 31.5836 156.998 30.5869C155.247 29.5633 153.846 28.176 152.796 26.4251C151.772 24.6742 151.26 22.7078 151.26 20.5259C151.26 18.3441 151.772 16.3911 152.796 14.6672C153.819 12.9163 155.22 11.5425 156.998 10.5458C158.776 9.54914 160.769 9.05081 162.978 9.05081C164.621 9.05081 166.143 9.33365 167.544 9.89933C168.944 10.465 170.143 11.2596 171.14 12.2832C172.136 13.2799 172.85 14.4651 173.281 15.8389L168.028 18.1016C167.651 16.9972 167.005 16.1218 166.089 15.4753C165.2 14.8288 164.163 14.5055 162.978 14.5055C161.927 14.5055 160.984 14.7614 160.149 15.2732C159.341 15.785 158.695 16.4989 158.21 17.4147C157.752 18.3306 157.523 19.3811 157.523 20.5664C157.523 21.7516 157.752 22.8021 158.21 23.718C158.695 24.6338 159.341 25.3477 160.149 25.8595C160.984 26.3713 161.927 26.6272 162.978 26.6272C164.19 26.6272 165.24 26.3039 166.129 25.6574C167.018 25.011 167.651 24.1355 168.028 23.0311L173.281 25.3342C172.877 26.6272 172.177 27.7855 171.18 28.8091C170.183 29.8327 168.985 30.6408 167.584 31.2334C166.183 31.7991 164.648 32.0819 162.978 32.0819Z"
        fill={fill}
      />
      <Path
        d="M176.85 31.597V1.01013H182.911V20.6068L180.648 19.8795L190.386 9.53568H197.861L189.861 18.4249L197.821 31.597H190.952L184.285 20.4047L187.8 19.5158L181.052 26.8696L182.911 23.3543V31.597H176.85Z"
        fill={fill}
      />
    </Svg>
  );
}
