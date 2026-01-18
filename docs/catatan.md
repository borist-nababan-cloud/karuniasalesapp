Deployment failed: Command execution failed (exit code 1): docker exec xcc404wg8g44k4488wwswkkw bash -c 'bash /artifacts/build.sh'
2025-Dec-23 03:46:48.217096
Error: #0 building with "default" instance using docker driver
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#1 [internal] load build definition from Dockerfile
2025-Dec-23 03:46:48.217096
#1 transferring dockerfile: 2.28kB done
2025-Dec-23 03:46:48.217096
#1 DONE 0.0s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#2 [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2025-Dec-23 03:46:48.217096
#2 DONE 0.4s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#3 [internal] load .dockerignore
2025-Dec-23 03:46:48.217096
#3 transferring context: 2B done
2025-Dec-23 03:46:48.217096
#3 DONE 0.0s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#4 [stage-0  1/16] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2025-Dec-23 03:46:48.217096
#4 DONE 0.0s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#5 [internal] load build context
2025-Dec-23 03:46:48.217096
#5 transferring context: 1.31MB 0.0s done
2025-Dec-23 03:46:48.217096
#5 DONE 0.1s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#6 [stage-0  6/16] RUN nix-env -if .nixpacks/nixpkgs-ba913eda2df8eb72147259189d55932012df6301.nix && nix-collect-garbage -d
2025-Dec-23 03:46:48.217096
#6 CACHED
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#7 [stage-0  2/16] WORKDIR /app/
2025-Dec-23 03:46:48.217096
#7 CACHED
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#8 [stage-0  4/16] RUN nix-env -if .nixpacks/nixpkgs-23f9169c4ccce521379e602cc82ed873a1f1b52b.nix && nix-collect-garbage -d
2025-Dec-23 03:46:48.217096
#8 CACHED
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#9 [stage-0  5/16] COPY .nixpacks/nixpkgs-ba913eda2df8eb72147259189d55932012df6301.nix .nixpacks/nixpkgs-ba913eda2df8eb72147259189d55932012df6301.nix
2025-Dec-23 03:46:48.217096
#9 CACHED
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#10 [stage-0  7/16] RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends curl wget
2025-Dec-23 03:46:48.217096
#10 CACHED
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#11 [stage-0  3/16] COPY .nixpacks/nixpkgs-23f9169c4ccce521379e602cc82ed873a1f1b52b.nix .nixpacks/nixpkgs-23f9169c4ccce521379e602cc82ed873a1f1b52b.nix
2025-Dec-23 03:46:48.217096
#11 CACHED
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#12 [stage-0  8/16] COPY .nixpacks/assets /assets/
2025-Dec-23 03:46:48.217096
#12 CACHED
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#13 [stage-0  9/16] COPY . /app/.
2025-Dec-23 03:46:48.217096
#13 DONE 0.1s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#14 [stage-0 10/16] RUN  caddy fmt --overwrite /assets/Caddyfile
2025-Dec-23 03:46:48.217096
#14 DONE 0.2s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#15 [stage-0 11/16] COPY . /app/.
2025-Dec-23 03:46:48.217096
#15 DONE 0.1s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#16 [stage-0 12/16] RUN --mount=type=cache,id=p8cwk0skoc00kc80kwskoco8-/root/npm,target=/root/.npm npm install
2025-Dec-23 03:46:48.217096
#16 5.570
2025-Dec-23 03:46:48.217096
#16 5.570 added 403 packages, and audited 404 packages in 5s
2025-Dec-23 03:46:48.217096
#16 5.570
2025-Dec-23 03:46:48.217096
#16 5.570 73 packages are looking for funding
2025-Dec-23 03:46:48.217096
#16 5.570   run `npm fund` for details
2025-Dec-23 03:46:48.217096
#16 5.572
2025-Dec-23 03:46:48.217096
#16 5.572 found 0 vulnerabilities
2025-Dec-23 03:46:48.217096
#16 DONE 6.3s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#17 [stage-0 13/16] COPY . /app/.
2025-Dec-23 03:46:48.217096
#17 DONE 0.1s
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
#18 [stage-0 14/16] RUN --mount=type=cache,id=p8cwk0skoc00kc80kwskoco8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-Dec-23 03:46:48.217096
#18 0.494
2025-Dec-23 03:46:48.217096
#18 0.494 > salesapps@1.0.1 build
2025-Dec-23 03:46:48.217096
#18 0.494 > tsc -b && vite build
2025-Dec-23 03:46:48.217096
#18 0.494
2025-Dec-23 03:46:48.217096
#18 4.337 src/features/spk/CreateSpkForm.tsx(316,41): error TS2339: Property 'id' does not exist on type 'never'.
2025-Dec-23 03:46:48.217096
#18 4.338 src/features/spk/CreateSpkForm.tsx(319,35): error TS2339: Property 'id' does not exist on type 'never'.
2025-Dec-23 03:46:48.217096
#18 4.901 npm notice
2025-Dec-23 03:46:48.217096
#18 4.901 npm notice New major version of npm available! 10.9.3 -> 11.7.0
2025-Dec-23 03:46:48.217096
#18 4.901 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
2025-Dec-23 03:46:48.217096
#18 4.901 npm notice To update run: npm install -g npm@11.7.0
2025-Dec-23 03:46:48.217096
#18 4.901 npm notice
2025-Dec-23 03:46:48.217096
#18 ERROR: process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code: 2
2025-Dec-23 03:46:48.217096
------
2025-Dec-23 03:46:48.217096
> [stage-0 14/16] RUN --mount=type=cache,id=p8cwk0skoc00kc80kwskoco8-node_modules/cache,target=/app/node_modules/.cache npm run build:
2025-Dec-23 03:46:48.217096
0.494 > salesapps@1.0.1 build
2025-Dec-23 03:46:48.217096
0.494 > tsc -b && vite build
2025-Dec-23 03:46:48.217096
0.494
2025-Dec-23 03:46:48.217096
4.337 src/features/spk/CreateSpkForm.tsx(316,41): error TS2339: Property 'id' does not exist on type 'never'.
2025-Dec-23 03:46:48.217096
4.338 src/features/spk/CreateSpkForm.tsx(319,35): error TS2339: Property 'id' does not exist on type 'never'.
2025-Dec-23 03:46:48.217096
4.901 npm notice
2025-Dec-23 03:46:48.217096
4.901 npm notice New major version of npm available! 10.9.3 -> 11.7.0
2025-Dec-23 03:46:48.217096
4.901 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
2025-Dec-23 03:46:48.217096
4.901 npm notice To update run: npm install -g npm@11.7.0
2025-Dec-23 03:46:48.217096
4.901 npm notice
2025-Dec-23 03:46:48.217096
------
2025-Dec-23 03:46:48.217096
2025-Dec-23 03:46:48.217096
5 warnings found (use docker --debug to expand):
2025-Dec-23 03:46:48.217096
- UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 24)
2025-Dec-23 03:46:48.217096
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "VITE_GOOGLE_MAPS_API_KEY") (line 13)
2025-Dec-23 03:46:48.217096
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "VITE_STRAPI_TOKEN") (line 13)
2025-Dec-23 03:46:48.217096
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "VITE_GOOGLE_MAPS_API_KEY") (line 14)
2025-Dec-23 03:46:48.217096
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "VITE_STRAPI_TOKEN") (line 14)
2025-Dec-23 03:46:48.217096
Dockerfile:30
2025-Dec-23 03:46:48.217096
--------------------
2025-Dec-23 03:46:48.217096
28 |     # build phase
2025-Dec-23 03:46:48.217096
29 |     COPY . /app/.
2025-Dec-23 03:46:48.217096
30 | >>> RUN --mount=type=cache,id=p8cwk0skoc00kc80kwskoco8-node_modules/cache,target=/app/node_modules/.cache npm run build
2025-Dec-23 03:46:48.217096
31 |
2025-Dec-23 03:46:48.217096
32 |
2025-Dec-23 03:46:48.217096
--------------------
2025-Dec-23 03:46:48.217096
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code: 2
2025-Dec-23 03:46:48.217096
exit status 1
2025-Dec-23 03:46:48.229490
Deployment failed. Removing the new version of your application.