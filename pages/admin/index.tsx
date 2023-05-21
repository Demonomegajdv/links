import { useEffect } from "react";
import { readLocalAdminConfig } from "../../lib/utils";
import { Config } from "../../types/config";

// Components
import Head from "next/head";
import Footer from "../../components/footer/Footer";
import Container from "../../components/layout/Container";
import Paper from "../../components/admin/Paper";
import PaperBody from "../../components/admin/PaperBody";
import BlockList from "../../components/content/BlockList";
import Cover from "../../components/admin/Cover";

// Types
import { Block } from "../../types/block";

// Google Tag manager
import TagManager from "react-gtm-module";
import { motion } from "framer-motion";
import { ThemeProvider } from "styled-components";
import { generateTheme } from "../../lib/theme";
import { getUsers } from "../../lib/users";
import MenuButton from "../../components/admin/MenuButton";
import { useConfig } from "../../contexts/Config";
import { ConfigProviderSerialized, ProviderType } from "../../types/provider";
import { ConfigProvider } from "../../providers/abstract";
import GitHubProvider from "../../providers/github";
import LocalProvider from "../../providers/local";
import { useAccount } from "../../contexts/Account";
import { UserData } from "../../types/request";
import Profile from "../../components/admin/Profile";

interface HomeProps {
  config: Config;
  provider: ConfigProviderSerialized;
  userData: UserData;
  redirect?: string;
  error?: string | null;
}

// Register Config Providers
GitHubProvider.register();
LocalProvider.register();

const supportedProviders = ConfigProvider.supportedProviders;

export default function Home({ config, provider, userData, error }: HomeProps) {
  const { setConfig, setProvider } = useConfig();
  const { setUserData } = useAccount();

  // Sets config for provider
  useEffect(() => {
    setConfig(config);
    setUserData(userData);
    setProvider(ConfigProvider.fromJSON(provider) as ConfigProvider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Google Tag Manager
  useEffect(() => {
    if (!config?.html?.google_analytics) {
      return;
    }
    TagManager.initialize({
      gtmId: config.html.google_analytics,
    });
  }, [config?.html?.google_analytics]);

  const { blocks, html, main } = config;
  return (
    <div>
      <Head>
        <title>{html?.title}</title>
        <meta
          name='description'
          content={html?.description || "HTML Link Description"}
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <ThemeProvider theme={generateTheme(config.theme || {})}>
        <Container>
          <motion.div
            initial={{ rotate: 180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <div className='sm:w-[800px] relative sm:mx-auto sm:max-w-lg'>
              <motion.div
                className={"absolute top-5 right-2 z-50"}
                initial={{ marginTop: 50, opacity: 0 }}
                animate={{ marginTop: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              ></motion.div>
              <Cover>
                <Profile title={main.title} picture={main.picture} />
                <div>
                  <MenuButton />
                </div>
              </Cover>
              <Paper>
                <div className='divide-y divide-gray-300/50'>
                  <PaperBody>
                    <BlockList blocks={blocks as Block[]} />
                  </PaperBody>

                  {error && <div>{error}</div>}
                </div>
              </Paper>
              <Footer />
            </div>
          </motion.div>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  let config: Config | null = null;
  let error = null;
  let provider: ConfigProvider = LocalProvider.createInstance("");
  let userData: UserData | null = null;

  if (!process.env.VERIFIED) {
    return {
      redirect: {
        permanent: false,
        destination: process.env.NEXT_PUBLIC_DOMAIN_REDIRECT,
      },
      props: { error: "Not yet verified" },
    };
  }

  if (process.env.DOMAIN_MATCH) {
    try {
      // Get config from provider (expected USERNAME.PROVIDER.hodl.ar)
      // Subdomain is HODL user
      const hostname = context.req.headers.host.split(".");
      const subdomain = hostname.shift();

      // TODO: Query single user
      const users = await getUsers();
      userData = users.find((user: any) => user.id === subdomain);
      if (!userData) {
        throw new Error("User not found on HODL.ar");
      }
      config = await readLocalAdminConfig();
    } catch (e: any) {
      console.warn("Invalid username or subdomain: " + e.message);
      error = e.message;
      return {
        redirect: {
          permanent: false,
          destination: process.env.NEXT_PUBLIC_DOMAIN_REDIRECT,
        },
        props: { error },
      };
    }
  }

  (config as Config).verified = !!process.env.VERIFIED;

  return {
    props: {
      config,
      provider: provider.toJSON(),
      userData,
      error,
    },
  };
}
