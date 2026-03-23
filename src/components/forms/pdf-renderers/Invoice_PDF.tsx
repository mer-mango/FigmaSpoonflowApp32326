import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link, Image } from '@react-pdf/renderer';

// Logo image - Empower Health Strategies logo (600px width PNG converted to base64)
const logoImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAADACAYAAADYzB3bAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEtGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTEyLTE5PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjFiMGY3Y2QyLTgwOWUtNDhhNi1hYmVhLTUxZGJkNWJkN2FkOTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5VbnRpdGxlZCBkZXNpZ24gLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlv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';

// Brandmark image - base64 encoded SVG
const brandMarkImage = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiBkYXRhLWJib3g9IjQuMDQzIDMyLjc4NyAyOTEuMTgyIDQ3Ljk3OSIgaGVpZ2h0PSIxNTAiIHZpZXdCb3g9IjQuMDQzIDMyLjc4NyAyOTEuMTgyIDQ3Ljk3OSIgd2lkdGg9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkYXRhLXR5cGU9ImNvbG9yIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkVtcG93ZXIgSGVhbHRoIFN0cmF0ZWdpZXMgTG9nbyIgd2l4c2hhcGVpZD0iYjcxNjY0XzgzM2IwNzMzZTg5MDQ4M2FiYzY5MWNkY2Q3NTA3Y2JhLnN2ZyI+CiAgICA8Zz4KICAgICAgICA8ZGVmcz4KICAgICAgICAgICAgPGNsaXBQYXRoIGlkPSIyZDc0NTJlMC1hNDZkLTQzZDctOGIzYS0wNjNhZGU2MTFjZTJfY29tcC1tam12eGdtY19yX2NvbXAtbWNiMmNwdjEiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTQgNTIuMDYzaDI3LjQ5NlY3Ni4wNUg0Wm0wIDAiPjwvcGF0aD4KICAgICAgICAgICAgPC9jbGlwUGF0aD4KICAgICAgICAgICAgPGNsaXBQYXRoIGlkPSI0ZTZjYWNhMC1hYjQ3LTRiZTQtYTJiOC05MjFjNjljODlhZmRfY29tcC1tam12eGdtY19yX2NvbXAtbWNiMmNwdjEiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTIyLjMyOCA1Mi43NjJjLTEuNDA2LS40MjItMy4wMDgtLjctNC41ODItLjctMS41NyAwLTMuMDgyLjIzOS00LjQ3Ni42Ni0uMDMyLjAxMi0uMDYuMDEyLS4wOS4wMjgtNS4yMzUgMS42ODgtOS4wOSA2LjE0NS05LjE2NCAxMS4yMjd2MTEuMzMyYzAgLjE5NS4wNzguMzgyLjIxNC41MjMuMTQxLjE0LjMzMi4yMTkuNTI4LjIxOUgzMC43NWMuMiAwIC4zODctLjA3OC41MjctLjIxOWEuNzQuNzQgMCAwIDAgLjIyLS41MjNWNjMuOTg0Yy0uMDc1LTUuMTEzLTMuODcyLTkuNTc0LTkuMTY5LTExLjIyMm0wIDAiPjwvcGF0aD4KICAgICAgICAgICAgPC9jbGlwUGF0aD4KICAgICAgICAgICAgPGNsaXBQYXRoIGlkPSJiZDE3NDgwZC0xZjI4LTRiZjAtOWExZi0yYmJmY2Q3ZDNmYzhfY29tcC1tam12eGdtY19yX2NvbXAtbWNiMmNwdjEiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTI4Ljk1MyA0MC4xNjRoMTQuMzEzdjE0LjMxM0gyOC45NTNabTAgMCI+PC9wYXRoPgogICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICA8Y2xpcFBhdGggaWQ9ImJhYzhkY2NhLTUzZWYtNDU2My1hZWVkLWRlODdhNjI5MjJjY19jb21wLW1qbXZ4Z21jX3JfY29tcC1tY2IyY3B2MSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzYuMTEgNDAuMTY0YTcuMTU1IDcuMTU1IDAgMCAwLTcuMTU3IDcuMTU2IDcuMTU1IDcuMTU1IDAgMCAwIDcuMTU2IDcuMTU3IDcuMTYgNy4xNiAwIDAgMCA3LjE1Ny03LjE1NyA3LjE2IDcuMTYgMCAwIDAtNy4xNTctNy4xNTZtMCAwIj48L3BhdGg+CiAgICAgICAgICAgIDwvY2xpcFBhdGg+CiAgICAgICAgICAgIDxjbGlwUGF0aCBpZD0iYmRmNGNkYmUtNGNhYi00MGY0LWFlOTktMWQ3ODI5NDdjY2RlX2NvbXAtbWptdnhnbWNfcl9jb21wLW1jYjJjcHYxIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMi4yIDU2Ljc4MWgyNy41NDZ2MjMuOTg1SDIyLjJabTAgMCI+PC9wYXRoPgogICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICA8Y2xpcFBhdGggaWQ9ImI0MzlhMDhjLWVmZWMtNGFhYy1hNGQxLWI4YWE0YzlkMjlmNl9jb21wLW1qbXZ4Z21jX3JfY29tcC1tY2IyY3B2MSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDAuNTgyIDU3LjQ4Yy0xLjQxLS40MjEtMy4wMTItLjY5OS00LjU4Mi0uNjk5YTE1LjUgMTUuNSAwIDAgMC00LjQ4LjY2Yy0uMDI4LjAxMi0uMDYuMDEyLS4wODYuMDI4LTUuMjM5IDEuNjg3LTkuMDk0IDYuMTQ0LTkuMTY4IDExLjIyNnYxMS4zMjhhLjc0Ljc0IDAgMCAwIC43NDYuNzQzaDI1Ljk5MmEuNzYuNzYgMCAwIDAgLjUyNy0uMjE1Ljc2Ljc2IDAgMCAwIC4yMTUtLjUyOHYtMTEuMzJjLS4wNzQtNS4xMTctMy44NzEtOS41NzQtOS4xNjQtMTEuMjIzbTAgMCI+PC9wYXRoPgogICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICA8Y2xpcFBhdGggaWQ9IjY4MWI5Y2YzLWE5N2EtNGQ2My04MDFjLTBjZjVhMDQwYzBmZDFfY29tcC1tam12eGdtY19yX2NvbXAtbWNiMmNwdjEiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE4LjUzNSA1OS45MjZoMTEuOTUzdjExLjk1M0gxOC41MzVabTAgMCI+PC9wYXRoPgogICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICA8Y2xpcFBhdGggaWQ9ImNjZGMxZGVmLWMxMjktNDJmZS1hZjk2LTYzODljYTY2YWM3Nl9jb21wLW1qbXZ4Z21jX3JfY29tcC1tY2IyY3B2MSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAuNjAyIDM1LjQ1SDI0LjkxdjE0LjMwOEgxMC42MDJabTAgMCI+PC9wYXRoPgogICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICA8Y2xpcFBhdGggaWQ9ImU3YWJiOWUzLWY5MWYtNDIzMC1iY2M5LWM2MmFlZGFlYzViOV9jb21wLW1qbXZ4Z21jX3JfY29tcC1tY2IyY3B2MSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTcuNzU0IDM1LjQ1YTcuMTU0IDcuMTU0IDAgMSAwIC4wMDQgMTQuMzA4IDcuMTU0IDcuMTU0IDAgMCAwLS4wMDQtMTQuMzA5bTAgMCI+PC9wYXRoPgogICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgIDwvZGVmcz4KICAgICAgICA8cGF0aCBkPSJNNzcuNTA0IDQ1LjIwOXEwIC43MzYtLjA5MyAxLjUzSDY1LjE5cS4xNDIgMi4yNyAxLjU0OCAzLjU0OCAxLjQwNiAxLjI2NSAzLjQyMiAxLjI2NSAxLjY0IDAgMi43MzQtLjc2NWE0LjE3IDQuMTcgMCAwIDAgMS41NjMtMi4wNjNoMi43MzRjLS40MDYgMS40NjktMS4yMjcgMi42NjgtMi40NTMgMy41OTRxLTEuODQ2IDEuMzc2LTQuNTc4IDEuMzc1Yy0xLjQ2MSAwLTIuNzYyLS4zMi0zLjkwNy0uOTY5cS0xLjcwMy0uOTgzLTIuNjg3LTIuNzgxYy0uNjQ5LTEuMTk1LS45NjktMi41ODYtLjk2OS00LjE3MnEwLTIuMzc0LjkzOC00LjE1Ni45NDgtMS43OTMgMi42NzItMi43NSAxLjcxNS0uOTY4IDMuOTUzLS45NjkgMi4xNjcuMDAyIDMuODQzLjk1M2E2LjY1IDYuNjUgMCAwIDEgMi41NzkgMi42MXEuOTIgMS42NTcuOTIxIDMuNzVtLTIuNjI1LS41MzJxMC0xLjQ1MS0uNjU2LTIuNWE0LjEgNC4xIDAgMCAwLTEuNzUtMS41NzggNS40IDUuNCAwIDAgMC0yLjQyMi0uNTQ3cS0xLjkzOC4wMDItMy4yOTcgMS4yMzVjLS44OTguODEyLTEuNDA2IDEuOTQ1LTEuNTMgMy4zOVptMCAwIiBmaWxsPSIjMDM0ODYzIiBkYXRhLWNvbG9yPSIxIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTk5LjIyNyAzNy44NjVxMS43OTMgMCAzLjE4OC43NSAxLjM4OS43MzcgMi4yMDMgMi4yMTkuODEgMS40NzIuODEyIDMuNTkzdjkuMDE2aC0yLjUxNXYtOC42NTZxMC0yLjI3OS0xLjEyNS0zLjQ4NWMtLjc1LS44MTItMS43NzQtMS4yMTgtMy4wNjMtMS4yMThxLTEuOTY5IDAtMy4xNCAxLjI2NS0xLjE3MiAxLjI2Ny0xLjE3MiAzLjY3MnY4LjQyMmgtMi41MTZ2LTguNjU2YzAtMS41Mi0uMzgzLTIuNjgtMS4xNC0zLjQ4NXEtMS4xMjUtMS4yMTgtMy4wNDctMS4yMTgtMS45ODYgMC0zLjE1NyAxLjI2NS0xLjE3MSAxLjI2Ny0xLjE3MiAzLjY3MnY4LjQyMmgtMi41M1YzOC4xNDZoMi41M3YyLjIwM2E1LjA2IDUuMDYgMCAwIDEgMi4wMTYtMS44MjhxMS4yNzgtLjY1NiAyLjgxMy0uNjU2IDEuOTE5LjAwMSAzLjQwNi44NzUgMS40ODMuODYxIDIuMjAzIDIuNTMxYTUgNSAwIDAgMSAyLjExLTIuNWMuOTg4LS42MDEgMi4wODUtLjkwNiAzLjI5Ni0uOTA2bTAgMCIgZmlsbD0iIzAzNDg2MyIgZGF0YS1jb2xvcj0iMSI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0xMTIuMTI2IDQwLjk3NGMuNS0uODc1IDEuMjQyLTEuNjAxIDIuMjM0LTIuMTg3cTEuNDk5LS44OSAzLjQ4NC0uODkgMi4wNDYgMCAzLjcwMy45ODMgMS42NTQuOTcyIDIuNjEgMi43NS42MzMgMS4xOC45NTMgNC4xMXEtLjAwMiAyLjMxNS0uOTUzIDQuMTI1LS45NTYgMS44MTUtMi42MSAyLjgyOC0xLjY1OCAxLjAwMS0zLjcwMyAxLTEuOTU1LjAwMS0zLjQ1My0uODc1LTEuNDg3LS44NzQtMi4yNjYtMi4xODd2MTAuMDYyaC0yLjUzVjM4LjE0NmgyLjUzWm0xMC4zNzQgNC43NjZxMC0xLjczMy0uNzAzLTMuMDE2LS42OS0xLjI3OC0xLjg3NS0xLjk1M2E1LjI1IDUuMjUgMCAwIDAtMi42MDktLjY3MnEtMS4zOTYgMC0yLjU3OC42ODgtMS4xOS42ODktMS45MDYgMS45ODQtLjcwNCAxLjMtLjcwMyAzIDAgMS43MzUuNzAzIDMuMDMxLjcxNSAxLjMgMS45MDYgMS45ODVhNS4xIDUuMSAwIDAgMCAyLjU3OC42NzJxMS40MTggMCAyLjYxLS42NzIgMS4xODItLjY4NCAxLjg3NC0xLjk4NS43MDQtMS4yOTMuNzA0LTMuMDYybTAgMCIgZmlsbD0iIzAzNDg2MyIgZGF0YS1jb2xvcj0iMSI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0xMzUuMTE1IDUzLjY5M2MtMS40MyAwLTIuNzI3LS4zMi0zLjg5MS0uOTY5YTcuMDcgNy4wNyAwIDAgMS0yLjczNC0yLjc4MXEtLjk4NS0xLjc5My0uOTg1LTQuMTcyYzAtMS41NjIuMzM2LTIuOTQxIDEuMDE2LTQuMTRxMS4wMTQtMS44MTIgMi43NjUtMi43NjYgMS43NjMtLjk2OCAzLjk1NC0uOTY5IDIuMTY4IDAgMy45MjEuOTY5IDEuNzYzLjk1NyAyLjc4MiAyLjc1IDEuMDE0IDEuNzgyIDEuMDE1IDQuMTU2LS4wMDEgMi4zOC0xLjA0NyA0LjE3MmE3LjMzIDcuMzMgMCAwIDEtMi44MjggMi43ODFjLTEuMTg3LjY0OS0yLjUxMS45NjktMy45NjguOTY5bTAtMi4yMzRxMS4zNzIuMDAyIDIuNTYyLS42NDEgMS4yLS42MzkgMS45MzgtMS45MjIuNzUtMS4yNzcuNzUtMy4xMjUtLjAwMi0xLjg0LS43MzUtMy4xMjUtLjcyLTEuMjc4LTEuODktMS45MDZhNS4yIDUuMiAwIDAgMC0yLjUzMi0uNjRxLTEuNDA3IDAtMi41NjIuNjRjLS43NzQuNDE4LTEuMzkgMS4wNTUtMS44NiAxLjkwNnEtLjY4OSAxLjI4NS0uNjg3IDMuMTI1YzAgMS4yNS4yMjMgMi4zMDUuNjcyIDMuMTU2cS42ODUgMS4yODUgMS44MjggMS45MDcgMS4xNTYuNjI2IDIuNTE2LjYyNW0wIDAiIGZpbGw9IiMwMzQ4NjMiIGRhdGEtY29sb3I9IjEiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJtMTY2LjY3OCAzOC4xNDYtNC43NjYgMTUuMjk3aC0yLjYyNWwtMy42ODctMTIuMTQtMy42NzIgMTIuMTRoLTIuNjI1bC00LjgxMy0xNS4yOTdoMi42MWwzLjUxNSAxMi44NDQgMy43ODEtMTIuODQ0aDIuNjFsMy43MDMgMTIuODc1IDMuNDY5LTEyLjg3NVptMCAwIiBmaWxsPSIjMDM0ODYzIiBkYXRhLWNvbG9yPSIxIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTE4My4xNTMgNDUuMjA5cTAgLjczNi0uMDkzIDEuNTNoLTEyLjIycS4xNDIgMi4yNyAxLjU0OCAzLjU0OCAxLjQwNiAxLjI2NSAzLjQyMiAxLjI2NSAxLjY0IDAgMi43MzQtLjc2NWE0LjE3IDQuMTcgMCAwIDAgMS41NjMtMi4wNjNoMi43MzRjLS40MDYgMS40NjktMS4yMjcgMi42NjgtMi40NTMgMy41OTRxLTEuODQ3IDEuMzc2LTQuNTc4IDEuMzc1Yy0xLjQ2MSAwLTIuNzYyLS4zMi0zLjkwNy0uOTY5cS0xLjcwMy0uOTgzLTIuNjg3LTIuNzgxYy0uNjQ5LTEuMTk1LS45NjktMi41ODYtLjk2OS00LjE3MnEwLTIuMzc0LjkzOC00LjE1Ni45NDgtMS43OTMgMi42NzItMi43NSAxLjcxNS0uOTY4IDMuOTUzLS45NjkgMi4xNjcuMDAyIDMuODQzLjk1M2E2LjY1IDYuNjUgMCAwIDEgMi41NzkgMi42MXEuOTIgMS42NTcuOTIxIDMuNzVtLTIuNjI1LS41MzJxMC0xLjQ1MS0uNjU2LTIuNWE0LjEgNC4xIDAgMCAwLTEuNzUtMS41NzggNS40IDUuNCAwIDAgMC0yLjQyMi0uNTQ3cS0xLjkzOC4wMDItMy4yOTcgMS4yMzVjLS44OTguODEyLTEuNDA2IDEuOTQ1LTEuNTMgMy4zOVptMCAwIiBmaWxsPSIjMDM0ODYzIiBkYXRhLWNvbG9yPSIxIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTE4OS4wMzQgNDAuNjNhNC44NCA0Ljg0IDAgMCAxIDEuOTA2LTIuMDNxMS4yNS0uNzM0IDMuMDMxLS43MzV2Mi42MjVoLS42NzJxLTQuMjY2IDAtNC4yNjYgNC42NHY4LjMxM2gtMi41M1YzOC4xNDZoMi41M1ptMCAwIiBmaWxsPSIjMDM0ODYzIiBkYXRhLWNvbG9yPSIxIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTY3LjY1NSA3OS42NzRxLTEuMzE2IDAtMi4zNi0uNDM3LTEuMDQ5LS40NTMtMS42NTYtMS4yOTctLjYxMS0uODQzLS42MjUtMkg2NS43Yy4wMzIuNTExLjIxMS45MTguNTQ3IDEuMjE4cS40OTguNDU2IDEuMzYuNDU0Ljg3MiAwIDEuMzc1LS40MjJjLjMzMi0uMjgyLjUtLjY0OS41LTEuMTEgMC0uMzYzLS4xMTgtLjY2NC0uMzQ0LS45MDZhMi4yNSAyLjI1IDAgMCAwLS44NDQtLjU2MnEtLjUxNS0uMjE3LTEuNDA2LS40N2MtLjgxMy0uMjM4LTEuNDc3LS40NzItMS45ODQtLjcwMmEzLjU0IDMuNTQgMCAwIDEtMS4zMTMtMS4wNjNxLS41NDktLjcwMy0uNTQ3LTEuODktLjAwMi0xLjEwNy41NDctMS45MzhxLjU2Mi0uODI2IDEuNTYzLTEuMjY2IDEuMDEyLS40MzUgMi4zMTItLjQzNyAxLjkzNSAwIDMuMTQuOTM3Yy44MTMuNjI1IDEuMjU4IDEuNSAxLjM0NCAyLjYyNWgtMi43NjVhMS40MiAxLjQyIDAgMCAwLS41NDctMS4wNjJxLS41MTYtLjQyMi0xLjM2LS40MjItLjczOCAwLTEuMTcxLjM3NS0uNDM5LjM3Ny0uNDM4IDEuMDk0IDAgLjUwNC4zMjguODQ0Yy4yMTkuMjE4LjQ4OS4zOTguODEzLjUzcS40OTguMjA2IDEuNDA2LjQ3IDEuMjE4LjM2MiAxLjk4NC43MTguNzc4LjM2NCAxLjMyOSAxLjA3OC41NjEuNzIuNTYyIDEuODkxYzAgLjY2OC0uMTggMS4yOTMtLjUzMSAxLjg3NXEtLjUxOC44Ni0xLjUxNiAxLjM3NWMtLjY2OC4zMzYtMS40NjUuNS0yLjM5LjVtMCAwIiBmaWxsPSIjMmY4MjliIiBkYXRhLWNvbG9yPSIyIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTk3LjE1IDY3LjAxOHYyLjAzMWgtMy4zNDN2MTAuNUg5MS4yOXYtMTAuNWgtMy4zMjh2LTIuMDMxWm0wIDAiIGZpbGw9IiMyZjgyOWIiIGRhdGEtY29sb3I9IjIiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJtMTE5LjgwNyA3OS41NDktMi43NjYtNC44OWgtMS4xODd2NC44OWgtMi41MTZWNjcuMDE4aDQuNzA0cTEuNDUgMCAyLjQ2OC41MTUgMS4wMzEuNTAzIDEuNTQ3IDEuMzc1LjUxNi44NzcuNTE2IDEuOTU0LS4wMDIgMS4yMzctLjcxOSAyLjIzNC0uNzIxIDEuMDAxLTIuMTQgMS4zNzVsMyA1LjA3OFptLTMuOTUzLTYuNzY2aDIuMTFxMS4wMTMuMDAxIDEuNTE1LS40ODQuNDk5LS41LjUtMS4zOWMwLS41Ny0uMTY4LTEuMDE2LS41LTEuMzI5cS0uNTAzLS40ODItMS41MTYtLjQ4NGgtMi4xMDlabTAgMCIgZmlsbD0iIzJmODI5YiIgZGF0YS1jb2xvcj0iMiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0xNDYuODkzIDc3LjE1OGgtNC45ODRsLS44MjkgMi4zOTFoLTIuNjRsNC41LTEyLjU0N2gyLjkzN2w0LjUgMTIuNTQ3aC0yLjY1NlptLS42ODgtMi4wMTUtMS44MTItNS4yMzUtMS44MTMgNS4yMzVabTAgMCIgZmlsbD0iIzJmODI5YiIgZGF0YS1jb2xvcj0iMiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0xNzQuOTUgNjcuMDE4djIuMDMxaC0zLjM0NHYxMC41aC0yLjUxNnYtMTAuNWgtMy4zMjh2LTIuMDMxWm0wIDAiIGZpbGw9IiMyZjgyOWIiIGRhdGEtY29sb3I9IjIiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMTkzLjY1MyA2OS4wNDl2My4xNGg0LjIxOXYxLjk4NWgtNC4yMTl2My4zMjhoNC43NjZ2Mi4wNDdoLTcuMjgyVjY3LjAwMmg3LjI4MnYyLjA0N1ptMCAwIiBmaWxsPSIjMmY4MjliIiBkYXRhLWNvbG9yPSIyIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTIyMy43ODMgNzAuNzgzYTMgMyAwIDAgMC0xLjE4OC0xLjE4N3EtLjc1MS0uNDIyLTEuNzY1LS40MjItMS4xMTQuMDAxLTEuOTcuNWEzLjQ0IDMuNDQgMCAwIDAtMS4zNDMgMS40MzhxLS40ODUuOTM3LS40ODQgMi4xNTZjMCAuODM2LjE2IDEuNTYyLjQ4NCAyLjE4N3EuNDk4LjkzOSAxLjM3NSAxLjQzOGMuNTgyLjMzNiAxLjI2Ni41IDIuMDQ3LjVxMS40MzUuMDAxIDIuMzQ0LS43NjYuOTItLjc2NCAxLjIxOS0yLjEyNWgtNC4zMTNWNzIuNThoNi43ODF2Mi4xODhhNiA2IDAgMCAxLTEuMDc4IDIuNDM3IDYuMSA2LjEgMCAwIDEtMi4xMjUgMS43ODJxLTEuMy42NzItMi45MjIuNjcxLTEuODE1IDAtMy4yODEtLjgxMmE2LjEgNi4xIDAgMCAxLTIuMjk3LTIuMjgxYy0uNTU1LS45Ny0uODI4LTIuMDY3LS44MjgtMy4yOTcgMC0xLjIyNy4yNzMtMi4zMzIuODI4LTMuMzEzYTYgNiAwIDAgMSAyLjI5Ny0yLjI4MXExLjQ2Ni0uODExIDMuMjY2LS44MTIgMi4xMjIgMCAzLjY4NyAxLjAzIDEuNTYgMS4wMzMgMi4xNTYgMi44OTFabTAgMCIgZmlsbD0iIzJmODI5YiIgZGF0YS1jb2xvcj0iMiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0yNDUuNzEgNjcuMDE4djEyLjUzMWgtMi41MTZWNjcuMDE4Wm0wIDAiIGZpbGw9IiMyZjgyOWIiIGRhdGEtY29sb3I9IjIiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMjY1LjA2NCA2OS4wNDl2My4xNGg0LjIxOXYxLjk4NWgtNC4yMTl2My4zMjhoNC43NjZ2Mi4wNDdoLTcuMjgyVjY3LjAwMmg3LjI4MnYyLjA0N1ptMCAwIiBmaWxsPSIjMmY4MjliIiBkYXRhLWNvbG9yPSIyIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTI5MC43ODggNzkuNjc0Yy0uODc1IDAtMS42NjUtLjE0NS0yLjM2LS40MzdxLTEuMDQ4LS40NTMtMS42NTYtMS4yOTdjLS40MDYtLjU2My0uNjE3LTEuMjI3LS42MjUtMmgyLjY4N2MuMDMyLjUxMS4yMTEuOTE4LjU0NyAxLjIxOHEuNDk4LjQ1NiAxLjM2LjQ1NC44NzIgMCAxLjM3NS0uNDIyYy4zMzItLjI4Mi41LS42NDkuNS0xLjExIDAtLjM2My0uMTE4LS42NjQtLjM0NC0uOTA2YTIuMjUgMi4yNSAwIDAgMC0uODQ0LS41NjJxLS41MTUtLjIxNy0xLjQwNi0uNDctMS4yMjEtLjM1Ny0xLjk4NC0uNzAyYTMuNTQgMy41NCAwIDAgMS0xLjMxMy0xLjA2M3EtLjU0OS0uNzAzLS41NDctMS44OS0uMDAyLTEuMTA3LjU0Ny0xLjkzOHEuNTYyLS44MjYgMS41NjMtMS4yNjYgMS4wMTItLjQzNSAyLjMxMi0uNDM3IDEuOTM1IDAgMy4xNC45MzdjLjgxMy42MjUgMS4yNTggMS41IDEuMzQ0IDIuNjI1aC0yLjc2NWExLjQyIDEuNDIgMCAwIDAtLjU0Ny0xLjA2MnEtLjUxNi0uNDIyLTEuMzYtLjQyMi0uNzM4IDAtMS4xNzEuMzc1LS40MzkuMzc3LS40MzggMS4wOTQgMCAuNTA0LjMyOC44NDRjLjIxOS4yMTguNDg5LjM5OC44MTMuNTNxLjQ5Ny4yMDYgMS40MDYuNDcgMS4yMTguMzYyIDEuOTg0LjcxOC43NzkuMzY0IDEuMzI5IDEuMDc4LjU2Mi43Mi41NjIgMS44OTFjMCAuNjY4LS4xOCAxLjI5My0uNTMxIDEuODc1cS0uNTE4Ljg2LTEuNTE2IDEuMzc1Yy0uNjY4LjMzNi0xLjQ2NS41LTIuMzkuNW0wIDAiIGZpbGw9IiMyZjgyOWIiIGRhdGEtY29sb3I9IjIiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMjEwLjY2IDM3LjY0NnEyLjY4My4wMDEgNC4yNSAxLjgxMyAxLjU3NyAxLjggMS41NzggNC44NTl2OS4xMjVoLTUuNDd2LTguNDA2cTAtMS4zMjUtLjcwMi0yLjA5NGMtLjQ2MS0uNTItMS4wNzgtLjc4MS0xLjg2LS43ODFxLTEuMjM1IDAtMS45MzcuNzgxLS42OS43NjgtLjY4OCAyLjA5NHY4LjQwNmgtNS40NjhWMzIuNzg3aDUuNDY4djcuMjM0cS43MzMtMS4wNjEgMS45NjktMS43MTkgMS4yMy0uNjU2IDIuODYtLjY1Nm0wIDAiIGZpbGw9IiMwMzQ4NjMiIGRhdGEtY29sb3I9IjEiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMjM1LjAxNiA0NS40MjdxLS4wMDEuNjQzLS4wNzggMS4yOTdoLTEwLjM2cS4wOTMgMS4yODQuNzE5IDEuOTA3LjYyMy42MjUgMS42MS42MjQgMS4zNTYgMCAxLjk1Mi0xLjIxOGg1LjgyOGE2LjkgNi45IDAgMCAxLTEuNDA2IDIuODlxLTEuMDQ4IDEuMjY3LTIuNjQgMi0xLjU5NS43Mi0zLjUxNi43Mi0yLjMxNSAwLTQuMTI1LS45ODVhNyA3IDAgMCAxLTIuODEyLTIuNzk3cS0xLjAxOC0xLjgxLTEuMDE2LTQuMjY2LS4wMDEtMi40NSAxLTQuMjVhNi45IDYuOSAwIDAgMSAyLjc5Ny0yLjc2NXExLjgxMi0uOTg1IDQuMTU2LS45ODUgMi4zMTEuMDAyIDQuMDk0Ljk1M2E2LjcgNi43IDAgMCAxIDIuNzk3IDIuNzJjLjY2NCAxLjE3OSAxIDIuNTYyIDEgNC4xNTVtLTUuNTc4LTEuMzU5YzAtLjY2NC0uMjI3LTEuMTkxLS42NzItMS41NzhxLS42NzUtLjU3Ni0xLjY3Mi0uNTc4LTEuMDAyIDAtMS42NC41NDctLjY0NS41NS0uODQ1IDEuNjA5Wm0wIDAiIGZpbGw9IiMwMzQ4NjMiIGRhdGEtY29sb3I9IjEiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMjM2LjkyIDQ1LjZjMC0xLjYxNC4yODktMy4wMjQuODc1LTQuMjM1cS44NzMtMS44MSAyLjM5LTIuNzgxIDEuNTMxLS45ODUgMy40MDctLjk4NWMxLjA3IDAgMiAuMjE1IDIuNzgxLjY0Ljc4MS40MyAxLjM4MyAxIDEuODEzIDEuNzJ2LTIuMTcyaDUuNDY4djE1LjY1NmgtNS40Njl2LTIuMTcycS0uNjQ1IDEuMDc4LTEuODI4IDEuNzM0Yy0uNzguNDMtMS43MDMuNjQxLTIuNzY1LjY0MXEtMS44NzYgMC0zLjQwNy0uOTg0Yy0xLjAxMS0uNjU3LTEuODA4LTEuNTg2LTIuMzktMi43OTctLjU4Ni0xLjIxOS0uODc1LTIuNjQtLjg3NS00LjI2Nm0xMS4yNjYgMHEtLjAwMS0xLjUtLjgyOS0yLjM2YTIuNjUgMi42NSAwIDAgMC0yLjAxNS0uODc1cS0xLjIyLjAwMi0yLjAzMi44Ni0uODEyLjg0NC0uODEyIDIuMzc0IDAgMS41MTguODEzIDIuMzljLjUzOS41ODcgMS4yMTguODc2IDIuMDMuODc2cTEuMjAyLjAwMSAyLjAxNi0uODYuODI3LS44NzEuODI4LTIuNDA2bTAgMCIgZmlsbD0iIzAzNDg2MyIgZGF0YS1jb2xvcj0iMSI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0yNjIuODEzIDMyLjc4N3YyMC42NTZoLTUuNDY4VjMyLjc4N1ptMCAwIiBmaWxsPSIjMDM0ODYzIiBkYXRhLWNvbG9yPSIxIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTI3NS43MzIgNDguNzg3djQuNjU2aC0yLjM3NXEtNiAuMDAyLTYtNS45Mzd2LTUuMTcyaC0xLjkyMnYtNC41NDdoMS45MjJWMzMuOTloNS41djMuNzk3aDIuODQ0djQuNTQ3aC0yLjg0NHY1LjI1YzAgLjQzLjA5OC43MzQuMjk3LjkyMXEuMjkyLjI4Mi45ODQuMjgybTAgMCIgZmlsbD0iIzAzNDg2MyIgZGF0YS1jb2xvcj0iMSI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0yODkuMTAxIDM3LjY0NnEyLjY4NS4wMDEgNC4yNSAxLjgxMyAxLjU3OCAxLjggMS41NzkgNC44NTl2OS4xMjVoLTUuNDd2LTguNDA2cTAtMS4zMjUtLjcwMi0yLjA5NGMtLjQ2MS0uNTItMS4wNzgtLjc4MS0xLjg2LS43ODFxLTEuMjM2IDAtMS45MzcuNzgxLS42OS43NjgtLjY4OCAyLjA5NHY4LjQwNmgtNS40NjlWMzIuNzg3aDUuNDd2Ny4yMzRxLjczMi0xLjA2MSAxLjk2OC0xLjcxOSAxLjIzLS42NTYgMi44Ni0uNjU2bTAgMCIgZmlsbD0iIzAzNDg2MyIgZGF0YS1jb2xvcj0iMSI+PC9wYXRoPgogICAgICAgIDxnIGNsaXAtcGF0aD0idXJsKCMyZDc0NTJlMC1hNDZkLTQzZDctOGIzYS0wNjNhZGU2MTFjZTJfY29tcC1tam12eGdtY19yX2NvbXAtbWNiMmNwdjEpIj4KICAgICAgICAgICAgPGcgY2xpcC1wYXRoPSJ1cmwoIzRlNmNhY2EwLWFiNDctNGJlNC1hMmI4LTkyMWM2OWM4OWFmZF9jb21wLW1qbXZ4Z21jX3JfY29tcC1tY2IyY3B2MSkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTMxLjQ5NiA3Ni4wNUg0LjA0M1Y1Mi4wNjRoMjcuNDUzWm0wIDAiIGZpbGw9IiMyZjgyOWIiIGRhdGEtY29sb3I9IjIiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgICAgICA8ZyBjbGlwLXBhdGg9InVybCgjYmQxNzQ4MGQtMWYyOC00YmYwLTlhMWYtMmJiZmNkN2QzZmM4X2NvbXAtbWptdnhnbWNfcl9jb21wLW1jYjJjcHYxKSI+CiAgICAgICAgICAgIDxnIGNsaXAtcGF0aD0idXJsKCNiYWM4ZGNjYS01M2VmLTQ1NjMtYWVlZC1kZTg3YTYyOTIyY2NfY29tcC1tam12eGdtY19yX2NvbXAtbWNiMmNwdjEpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOC45NTMgNDAuMTY0aDE0LjMxM3YxNC4zMTNIMjguOTUzWm0wIDAiIGZpbGw9IiMwMzQ4NjMiIGRhdGEtY29sb3I9IjEiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgICAgICA8ZyBjbGlwLXBhdGg9InVybCgjYmRmNGNkYmUtNGNhYi00MGY0LWFlOTktMWQ3ODI5NDdjY2RlX2NvbXAtbWptdnhnbWNfcl9jb21wLW1jYjJjcHYxKSI+CiAgICAgICAgICAgIDxnIGNsaXAtcGF0aD0idXJsKCNiNDM5YTA4Yy1lZmVjLTRhYWMtYTRkMS1iOGFhNGM5ZDI5ZjZfY29tcC1tam12eGdtY19yX2NvbXAtbWNiMmNwdjEpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik00OS43NDYgODAuNzY2SDIyLjI5M1Y1Ni43OGgyNy40NTNabTAgMCIgZmlsbD0iIzAzNDg2MyIgZGF0YS1jb2xvcj0iMSI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgICAgIDxnIGNsaXAtcGF0aD0idXJsKCM2ODFiOWNmMy1hOTdhLTRkNjMtODAxYy0wY2Y1YTA0MGMwZmQxX2NvbXAtbWptdnhnbWNfcl9jb21wLW1jYjJjcHYxKSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOS4yNjYgNjMuNTloLTIuODh2LTIuODhhLjc4NS43ODUgMCAwIDAtLjc4NC0uNzg0aC0yLjYxOGEuNzg1Ljc4NSAwIDAgMC0uNzg1Ljc4NXYyLjg3OUgxOS4zMmEuNzg1Ljc4NSAwIDAgMC0uNzg1Ljc4NXYyLjYxN2MwIC40MzQuMzUyLjc4NS43ODUuNzg1aDIuODh2Mi44OGMwIC40MzMuMzUuNzg0Ljc4NC43ODRoMi42MThhLjc4NS43ODUgMCAwIDAgLjc4NS0uNzg1di0yLjg3OWgyLjg3OWEuNzg1Ljc4NSAwIDAgMCAuNzg1LS43ODV2LTIuNjE3YS43ODUuNzg1IDAgMCAwLS43ODUtLjc4NW0wIDAiIGZpbGw9IiNmMWY4ZjgiIGRhdGEtY29sb3I9IjMiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICAgICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NjZGMxZGVmLWMxMjktNDJmZS1hZjk2LTYzODljYTY2YWM3Nl9jb21wLW1qbXZ4Z21jX3JfY29tcC1tY2IyY3B2MSkiPgogICAgICAgICAgICA8ZyBjbGlwLXBhdGg9InVybCgjZTdhYmI5ZTMtZjkxZi00MjMwLWJjYzktYzYyYWVkYWVjNWI5X2NvbXAtbWptdnhnbWNfcl9jb21wLW1jYjJjcHYxKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAuNjAyIDM1LjQ1SDI0LjkxdjE0LjMwOEgxMC42MDJabTAgMCIgZmlsbD0iIzJmODI5YiIgZGF0YS1jb2xvcj0iMiI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

// Register Lora font for headers
Font.register({
  family: 'Lora',
  fonts: [
    { 
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf',
      fontWeight: 400 
    },
    { 
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf',
      fontWeight: 700 
    },
  ],
});

// Register Poppins font for body text
Font.register({
  family: 'Poppins',
  fonts: [
    { 
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
      fontWeight: 400 
    },
    { 
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-500-normal.ttf',
      fontWeight: 500 
    },
    { 
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-600-normal.ttf',
      fontWeight: 600 
    },
  ],
});

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

interface InvoicePDFProps {
  documentData: InvoiceData;
}

// Define styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Poppins',
    fontSize: 10,
  },

  // Header with logo
  header: {
    flexDirection: 'column',
    marginBottom: 16,
    paddingBottom: 0, // Removed padding and border to match design
  },

  logo: {
    width: 180,
    height: 'auto',
  },

  logoText: {
    fontSize: 14,
    color: '#2f829b',
    fontFamily: 'Poppins',
    fontWeight: 400,
    letterSpacing: 0.5,
    marginBottom: 0,
  },

  tagline: {
    fontSize: 8,
    color: '#034863',
    fontFamily: 'Lora',
    fontWeight: 400,
    opacity: 0.7,
  },

  // Document title area
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  titleLeft: {
    flex: 1,
  },

  documentTitle: {
    fontSize: 18,
    color: '#034863',
    fontFamily: 'Lora',
    fontWeight: 400,
    marginBottom: 3,
  },

  invoiceNumber: {
    fontSize: 10,
    color: '#000000',
    fontFamily: 'Poppins',
    fontWeight: 400,
    opacity: 0.6,
  },

  // Date boxes
  dateBoxesRow: {
    flexDirection: 'row',
    gap: 10,
  },

  dateBox: {
    paddingTop: 8,
    paddingRight: 14,
    paddingBottom: 8,
    paddingLeft: 14,
    backgroundColor: '#f5fafb',
    border: '1pt solid #ddecf0',
    borderRadius: 4,
  },

  dueDateBox: {
    paddingTop: 8,
    paddingRight: 14,
    paddingBottom: 8,
    paddingLeft: 14,
    backgroundColor: '#6b2358',
    borderRadius: 4,
  },

  dateLabel: {
    fontSize: 7,
    color: '#2f829b',
    fontFamily: 'Poppins',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  dueDateLabel: {
    fontSize: 7,
    color: '#ffffff',
    opacity: 0.85,
    fontFamily: 'Poppins',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  dateValue: {
    fontSize: 11,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 400,
  },

  dueDateValue: {
    fontSize: 11,
    color: '#ffffff',
    fontFamily: 'Poppins',
    fontWeight: 400,
  },

  // Contact information section
  contactSection: {
    marginBottom: 10, // Reduced to tighten spacing and fit on one page
  },

  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 40,
  },

  contactColumn: {
    flex: 1,
  },

  contactLabel: {
    fontSize: 8,
    color: '#2f829b',
    fontFamily: 'Poppins',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  contactName: {
    fontSize: 12,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 500,
    marginBottom: 3,
  },

  contactText: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Poppins',
    fontWeight: 400,
    marginBottom: 2,
    lineHeight: 1.4,
    opacity: 0.8,
  },

  contactEmail: {
    fontSize: 9,
    color: '#2f829b',
    fontFamily: 'Poppins',
    fontWeight: 400,
    lineHeight: 1.4,
  },

  // Sections
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1pt solid #ddecf0',
  },

  sectionTitle: {
    fontSize: 16,
    color: '#034863',
    fontFamily: 'Lora',
    fontWeight: 400,
    marginBottom: 10,
  },

  // Table
  table: {
    border: '1pt solid #ddecf0',
    borderRadius: 4,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5fafb',
    borderBottom: '1pt solid #ddecf0',
    paddingTop: 6,
    paddingRight: 10,
    paddingBottom: 6,
    paddingLeft: 10,
  },

  tableHeaderCell: {
    fontSize: 7,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddecf0',
    paddingTop: 8,
    paddingRight: 10,
    paddingBottom: 8,
    paddingLeft: 10,
  },

  tableRowLast: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingRight: 10,
    paddingBottom: 8,
    paddingLeft: 10,
  },

  tableCell: {
    fontSize: 9,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 400,
    lineHeight: 1.3,
  },

  tableCellBold: {
    fontSize: 9,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 500,
  },

  // Column widths for table
  colDescription: {
    width: '50%',
  },

  colQuantity: {
    width: '16.66%',
    textAlign: 'center',
  },

  colRate: {
    width: '16.66%',
    textAlign: 'right',
  },

  colAmount: {
    width: '16.66%',
    textAlign: 'right',
  },

  // Totals section
  totalsSection: {
    backgroundColor: '#f5fafb',
    borderTop: '1pt solid #ddecf0',
    paddingTop: 8,
    paddingRight: 10,
    paddingBottom: 8,
    paddingLeft: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  totalDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTop: '1pt solid #6b2358',
  },

  totalLabel: {
    fontSize: 10,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 400,
  },

  totalValue: {
    fontSize: 10,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 400,
  },

  totalDueLabel: {
    fontSize: 11,
    color: '#6b2358',
    fontFamily: 'Poppins',
    fontWeight: 500,
  },

  totalDueValue: {
    fontSize: 11,
    color: '#6b2358',
    fontFamily: 'Poppins',
    fontWeight: 500,
  },

  // Content boxes (for payment terms, notes)
  contentBox: {
    backgroundColor: '#f5fafb',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #ddecf0',
  },

  contentText: {
    fontSize: 9,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 400,
    lineHeight: 1.4,
  },

  // Payment methods
  paymentMethodsGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  paymentMethodBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ffffff',
    border: '1pt solid #ddecf0',
    borderRadius: 4,
  },

  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  paymentMethodIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(47, 130, 155, 0.08)',
  },

  paymentMethodTitle: {
    fontSize: 10,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 500,
  },

  paymentMethodText: {
    fontSize: 8,
    color: '#034863',
    opacity: 0.65,
    fontFamily: 'Poppins',
    fontWeight: 400,
    lineHeight: 1.3,
  },

  // Footer
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: '1pt solid #ddecf0',
  },

  footerContactText: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Poppins',
    fontWeight: 400,
    marginBottom: 10,
    lineHeight: 1.4,
    opacity: 0.8,
  },

  footerRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  footerInfo: {
    width: '100%',
  },

  footerCompanyName: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Poppins',
    fontWeight: 400,
    marginBottom: 2,
  },

  footerLink: {
    fontSize: 9,
    color: '#2f829b',
    fontFamily: 'Poppins',
    fontWeight: 400,
    textDecoration: 'underline',
    marginBottom: 2,
  },

  footerCopyright: {
    fontSize: 9,
    color: '#034863',
    fontFamily: 'Poppins',
    fontWeight: 400,
    opacity: 0.7,
  },
});

export function InvoicePDF({ documentData }: InvoicePDFProps) {
  // Debug log - VERSION WITH LOGO AND BRANDMARK IMAGES
  console.log('🎨🖼️ Invoice_PDF.tsx - VERSION 2.0 - LOGO + BRANDMARK IMAGES LOADED');
  console.log('Logo image:', logoImage);
  console.log('Brandmark image:', brandMarkImage);
  
  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Provide default values
  const data = {
    invoiceNumber: documentData?.invoiceNumber || '',
    date: documentData?.date || '',
    dueDate: documentData?.dueDate || '',
    clientName: documentData?.clientName || '',
    clientContact: documentData?.clientContact || '',
    clientEmail: documentData?.clientEmail || '',
    clientPhone: documentData?.clientPhone || '',
    clientAddress: documentData?.clientAddress || '',
    lineItems: documentData?.lineItems || [],
    subtotal: documentData?.subtotal || 0,
    taxRate: documentData?.taxRate || 0,
    taxAmount: documentData?.taxAmount || 0,
    total: documentData?.total || 0,
    notes: documentData?.notes || '',
    paymentTerms: documentData?.paymentTerms || '',
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>EMPOWER HEALTH STRATEGIES</Text>
          </View>
        </View>

        {/* Document Title Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.documentTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>INVOICE #{data.invoiceNumber}</Text>
          </View>
          
          {/* Date Boxes */}
          <View style={styles.dateBoxesRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>INVOICE DATE</Text>
              <Text style={styles.dateValue}>{data.date}</Text>
            </View>
            <View style={styles.dueDateBox}>
              <Text style={styles.dueDateLabel}>DUE DATE</Text>
              <Text style={styles.dueDateValue}>{data.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <View style={styles.contactRow}>
            <View style={styles.contactColumn}>
              <Text style={styles.contactLabel}>BILL TO</Text>
              <Text style={styles.contactName}>{data.clientName}</Text>
              <Text style={styles.contactText}>{data.clientContact}</Text>
              <Text style={styles.contactEmail}>{data.clientEmail}</Text>
            </View>
            <View style={styles.contactColumn}>
              <Text style={styles.contactLabel}>FROM</Text>
              <Text style={styles.contactName}>Empower Health Strategies</Text>
              <Text style={styles.contactText}>Meredith Mangold, CPXP, Founder</Text>
              <Text style={styles.contactEmail}>meredith@empowerhealthstrategies.com</Text>
            </View>
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>DESCRIPTION</Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantity]}>QUANTITY</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>RATE</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>AMOUNT</Text>
            </View>

            {/* Table Rows */}
            {data.lineItems.map((item, index) => (
              <View
                key={item.id}
                style={index === data.lineItems.length - 1 ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQuantity]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colRate]}>${formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.tableCellBold, styles.colAmount]}>${formatCurrency(item.amount)}</Text>
              </View>
            ))}

            {/* Totals */}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>${formatCurrency(data.subtotal)}</Text>
              </View>
              <View style={styles.totalDueRow}>
                <Text style={styles.totalDueLabel}>Total Due:</Text>
                <Text style={styles.totalDueValue}>${formatCurrency(data.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Methods & Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods & Terms</Text>
          
          {data.paymentTerms && (
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{data.paymentTerms}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerContactText}>
            Please contact <Link src="mailto:meredith@empowerhealthstrategies.com">meredith@empowerhealthstrategies.com</Link> if you have any questions.
          </Text>
          
          <View style={styles.footerRow}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerCompanyName}>Empower Health Strategies, LLC</Text>
              <Link src="https://www.empowerhealthstrategies.com" style={styles.footerLink}>
                www.empowerhealthstrategies.com
              </Link>
              <Text style={styles.footerCopyright}>© 2025 Empower Health Strategies</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}